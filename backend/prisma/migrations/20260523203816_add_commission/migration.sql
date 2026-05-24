-- CreateTable
CREATE TABLE "Commission" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "platformRate" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "platformAmount" DECIMAL(65,30) NOT NULL,
    "laundryShopAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commission_orderId_key" ON "Commission"("orderId");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
