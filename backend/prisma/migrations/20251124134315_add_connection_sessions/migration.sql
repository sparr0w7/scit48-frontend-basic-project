-- CreateTable
CREATE TABLE `connection_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(45) NOT NULL,
    `connected_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disconnected_at` DATETIME(3) NULL,

    INDEX `ix_conn_sessions_ip_connected`(`ip`, `connected_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
