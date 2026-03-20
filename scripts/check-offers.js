const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.loanOffer.findMany({
    where: { status: 'published' },
    select: { 
      id: true, 
      name: true, 
      status: true, 
      isBroken: true,
      minAmount: true,
      maxAmount: true,
      minTerm: true,
      maxTerm: true,
    },
    take: 10
  });
  
  console.log('Published offers:', offers.length);
  console.log(JSON.stringify(offers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
