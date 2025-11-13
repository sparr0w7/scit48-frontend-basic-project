const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCategories() {
  try {
    // StoreCategory 테이블 데이터 확인
    const storeCategories = await prisma.storeCategory.findMany({
      include: {
        store: true,
        category: true
      },
      take: 5
    });
    
    console.log('StoreCategory 데이터 개수:', await prisma.storeCategory.count());
    console.log('첫 5개 데이터:', JSON.stringify(storeCategories, null, 2));
    
    // Category 테이블 데이터 확인
    const categories = await prisma.category.findMany();
    console.log('\nCategory 테이블 데이터:', JSON.stringify(categories, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategories();