const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    // 상점 확인
    const stores = await prisma.store.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        },
        menuItems: {
          take: 2
        }
      },
      take: 3
    });
    
    console.log('🏪 상점 데이터 샘플:');
    stores.forEach(store => {
      console.log(`\n📍 ${store.name}`);
      console.log(`   주소: ${store.address}`);
      console.log(`   최소주문: ${store.minOrderAmount}원`);
      console.log(`   배달비: ${store.deliveryFee}원`);
      console.log(`   카테고리: ${store.categories.map(c => c.category.name).join(', ')}`);
      console.log(`   메뉴 샘플:`);
      store.menuItems.forEach(menu => {
        console.log(`     - ${menu.name}: ${menu.price}원`);
      });
    });
    
    // 전체 통계
    const storeCount = await prisma.store.count();
    const menuCount = await prisma.menuItem.count();
    const categoryCount = await prisma.category.count();
    
    console.log('\n📊 전체 통계:');
    console.log(`   카테고리: ${categoryCount}개`);
    console.log(`   상점: ${storeCount}개`);
    console.log(`   메뉴: ${menuCount}개`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();