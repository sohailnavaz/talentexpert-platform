-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "lastLoginUserAgent" TEXT;

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "lastLoginUserAgent" TEXT;

