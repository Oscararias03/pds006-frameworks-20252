-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Computer" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "photoURL" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "checkinAt" TIMESTAMP(3),
    "checkoutAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Computer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDevice" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "checkinAt" TIMESTAMP(3),
    "checkoutAt" TIMESTAMP(3),
    "serial" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequentComputer" (
    "id" TEXT NOT NULL,
    "computerId" TEXT NOT NULL,
    "checkinURL" TEXT NOT NULL,
    "checkoutURL" TEXT NOT NULL,

    CONSTRAINT "FrequentComputer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrequentComputer_computerId_key" ON "FrequentComputer"("computerId");

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalDevice" ADD CONSTRAINT "MedicalDevice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentComputer" ADD CONSTRAINT "FrequentComputer_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
