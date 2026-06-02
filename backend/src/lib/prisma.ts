import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

(Decimal.prototype as any).toJSON = function () {
  return Number(this.toString());
};

const prisma = new PrismaClient();

export default prisma;
