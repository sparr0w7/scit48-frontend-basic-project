-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `from_ip` VARCHAR(45) NOT NULL,
    `to_ip` VARCHAR(45) NOT NULL,
    `subject` VARCHAR(120) NULL,
    `body` VARCHAR(2000) NOT NULL,
    `status` ENUM('sent', 'canceled', 'failed') NOT NULL DEFAULT 'sent',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `canceled_at` DATETIME(3) NULL,

    INDEX `ix_messages_toip_time`(`to_ip`, `created_at`, `id`),
    INDEX `ix_messages_fromip_time`(`from_ip`, `created_at`, `id`),
    INDEX `ix_messages_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
