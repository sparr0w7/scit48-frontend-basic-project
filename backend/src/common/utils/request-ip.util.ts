import { Request } from 'express';

type IpHeaders = Request['headers'] | Record<string, string | string[] | undefined>;

interface IpSource {
  headers: IpHeaders;
  ip?: string;
  socket?: {
    remoteAddress?: string | undefined;
  };
  connection?: {
    remoteAddress?: string | undefined;
  };
  address?: string;
}

export function getClientIp(source: IpSource): string {
  const forwarded = source.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return (
    source.ip ||
    source.address ||
    source.socket?.remoteAddress ||
    source.connection?.remoteAddress ||
    ''
  );
}
