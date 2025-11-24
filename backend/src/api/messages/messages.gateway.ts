import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { getClientIp } from '../../common/utils/request-ip.util';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly clientsByIp = new Map<string, Set<Socket>>();
  private readonly sessionByClientId = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    const ip = this.resolveClientIp(client);

    if (!ip) {
      this.logger.warn(`Unable to resolve IP for socket ${client.id}`);
      client.disconnect(true);
      return;
    }

    const clients = this.clientsByIp.get(ip) ?? new Set<Socket>();
    clients.add(client);
    this.clientsByIp.set(ip, clients);

    this.recordConnect(client.id, ip);
    this.logger.debug(`Client connected from ${ip}. Total: ${clients.size}`);
  }

  handleDisconnect(client: Socket) {
    const ip = this.resolveClientIp(client);
    if (!ip) {
      return;
    }

    const clients = this.clientsByIp.get(ip);
    if (!clients) {
      return;
    }

    clients.delete(client);
    if (clients.size === 0) {
      this.clientsByIp.delete(ip);
    }

    this.recordDisconnect(client.id);
  }

  emitIncomingMessage(message: Message) {
    this.emitToIp(message.toIP, 'message.received', message);
  }

  emitMessageUpdate(message: Message) {
    this.emitToIp(message.toIP, 'message.updated', message);
    this.emitToIp(message.fromIP, 'message.updated', message);
  }

  emitMessageDeleted(message: Pick<Message, 'id' | 'fromIP' | 'toIP'>) {
    this.emitToIp(message.toIP, 'message.deleted', message);
    this.emitToIp(message.fromIP, 'message.deleted', message);
  }

  private emitToIp(ip: string, event: string, payload: unknown) {
    const clients = this.clientsByIp.get(ip);
    if (!clients || clients.size === 0) {
      return;
    }

    clients.forEach((client) => client.emit(event, payload));
  }

  private resolveClientIp(client: Socket) {
    const handshake = client.handshake;
    const queryIp = typeof handshake.query.ip === 'string' ? handshake.query.ip : undefined;
    if (queryIp) {
      return queryIp;
    }

    return getClientIp({
      headers: handshake.headers as any,
      ip: handshake.address,
      socket: handshake as any,
      connection: handshake as any,
      address: handshake.address,
    });
  }

  private async recordConnect(clientId: string, ip: string) {
    const sessionId = randomUUID();
    this.sessionByClientId.set(clientId, sessionId);

    try {
      await this.prisma.connectionSession.create({
        data: {
          id: sessionId,
          ip,
        },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to record connection for ${ip}: ${err.message}`, err.stack);
    }
  }

  private async recordDisconnect(clientId: string) {
    const sessionId = this.sessionByClientId.get(clientId);
    if (!sessionId) {
      return;
    }

    this.sessionByClientId.delete(clientId);

    try {
      await this.prisma.connectionSession.updateMany({
        where: { id: sessionId, disconnectedAt: null },
        data: { disconnectedAt: new Date() },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to record disconnect for session ${sessionId}: ${err.message}`,
        err.stack,
      );
    }
  }
}
