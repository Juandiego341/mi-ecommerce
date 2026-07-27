-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'CLIENTE';
