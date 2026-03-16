const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.loanOffer.count();
  console.log('Total offers:', count);
  
  const published = await prisma.loanOffer.count({
    where: { status: 'published' }
  });
  console.log('Published:', published);
  
  const showOnHomepage = await prisma.loanOffer.count({
    where: { status: 'published', showOnHomepage: true }
  });
  console.log('Published + showOnHomepage:', showOnHomepage);
  
  const offers = await prisma.loanOffer.findMany({
    where: { status: 'published', showOnHomepage: true },
    take: 3,
    select: { id: true, name: true, firstLoanRate: true, status: true }
  });
  console.log('Sample offers:', JSON.stringify(offers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
