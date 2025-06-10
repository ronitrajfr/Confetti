-- AlterTable
ALTER TABLE "subConfettiChannel" ALTER COLUMN "image" SET DEFAULT 'https://placehold.co/100x100/000000/FFFFFF';

-- CreateIndex
CREATE INDEX "Member_role_idx" ON "Member"("role");
