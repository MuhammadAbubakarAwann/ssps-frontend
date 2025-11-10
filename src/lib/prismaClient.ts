import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

const prismaClientGenerator = () => {
  let prismaClient: PrismaClient | undefined;
  return (): PrismaClient => {
    if (prismaClient) return prismaClient;

    if (globalThis.prismaClient) prismaClient = globalThis.prismaClient;
    else prismaClient = new PrismaClient();

    if (process.env.NODE_ENV === 'development')
      globalThis.prismaClient = prismaClient;
    if (!prismaClient) throw new Error('Prisma Client not defined');
    return prismaClient;
  };
};

export default prismaClientGenerator();
