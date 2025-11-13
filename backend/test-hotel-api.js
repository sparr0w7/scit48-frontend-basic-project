/**
 * 호텔 API 연계 테스트 스크립트
 * 
 * 실행 방법:
 * 1. Backend 서버 실행: cd backend && npm run start:dev
 * 2. 테스트 실행: node test-hotel-api.js
 */

const API_BASE_URL = 'http://localhost:8000/api';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// 테스트 로그 함수
function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    info: `${colors.blue}ℹ️`,
  };
  console.log(`${prefix[type] || prefix.info} ${message}${colors.reset}`);
}

// 테스트 케이스
const testCases = [
  {
    name: '서울 시청 주변 5km 호텔 검색',
    params: {
      latitude: 37.5665,
      longitude: 126.9780,
      radius: 5,
    },
  },
  {
    name: '강남역 주변 3km 호텔 검색',
    params: {
      latitude: 37.4979,
      longitude: 127.0276,
      radius: 3,
    },
  },
  {
    name: '명동 주변 2km 호텔 검색 (radius 없음)',
    params: {
      latitude: 37.5640,
      longitude: 126.9886,
    },
  },
];

// API 테스트 함수
async function testHotelAPI(testCase) {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`📍 테스트: ${testCase.name}`);
  console.log(`   파라미터: ${JSON.stringify(testCase.params)}`);
  
  const params = new URLSearchParams();
  Object.entries(testCase.params).forEach(([key, value]) => {
    params.append(key, value.toString());
  });
  
  const url = `${API_BASE_URL}/hotels/nearby?${params.toString()}`;
  console.log(`   URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const endTime = Date.now();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    log(`응답 시간: ${endTime - startTime}ms`, 'success');
    log(`호텔 개수: ${data.length}개`, 'success');
    
    // 데이터 검증
    if (data.length > 0) {
      console.log('\n   📊 응답 데이터 샘플 (첫 3개):');
      data.slice(0, 3).forEach((hotel, index) => {
        console.log(`   ${index + 1}. ${hotel.name}`);
        console.log(`      - ID: ${hotel.id}`);
        console.log(`      - 주소: ${hotel.address_ko}`);
        console.log(`      - 거리: ${hotel.distance ? hotel.distance.toFixed(2) + 'km' : 'N/A'}`);
        console.log(`      - 좌표: (${hotel.latitude}, ${hotel.longitude})`);
        
        // 데이터 타입 검증
        validateHotelData(hotel);
      });
    } else {
      log('검색 결과가 없습니다', 'warning');
    }
    
    return { success: true, data };
  } catch (error) {
    log(`테스트 실패: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// 호텔 데이터 검증
function validateHotelData(hotel) {
  const requiredFields = ['id', 'name', 'address', 'address_ko', 'latitude', 'longitude'];
  const missingFields = requiredFields.filter(field => !(field in hotel));
  
  if (missingFields.length > 0) {
    log(`      ⚠️ 누락된 필드: ${missingFields.join(', ')}`, 'warning');
  }
  
  // 타입 검증
  if (typeof hotel.latitude !== 'number') {
    log(`      ⚠️ latitude가 number 타입이 아님: ${typeof hotel.latitude}`, 'warning');
  }
  if (typeof hotel.longitude !== 'number') {
    log(`      ⚠️ longitude가 number 타입이 아님: ${typeof hotel.longitude}`, 'warning');
  }
  if (hotel.distance !== undefined && typeof hotel.distance !== 'number') {
    log(`      ⚠️ distance가 number 타입이 아님: ${typeof hotel.distance}`, 'warning');
  }
}

// Frontend 서비스 호환성 테스트
async function testFrontendCompatibility() {
  console.log(`\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('🔗 Frontend 서비스 호환성 테스트');
  
  // Frontend의 hotel.service.ts 로직 재현
  const latitude = 37.5665;
  const longitude = 126.9780;
  const radius = 5;
  
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (radius) {
    params.append('radius', radius.toString());
  }
  
  const url = `${API_BASE_URL}/hotels/nearby?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Frontend에서 기대하는 데이터 구조 확인
    const processedData = data.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      address_ko: hotel.address_ko,
      latitude: Number(hotel.latitude),
      longitude: Number(hotel.longitude),
      distance: Number(hotel.distance || 0),
    }));
    
    log('Frontend 호환성 테스트 성공', 'success');
    console.log('   처리된 데이터 샘플:', processedData[0]);
    
    return processedData;
  } catch (error) {
    log(`Frontend 호환성 테스트 실패: ${error.message}`, 'error');
    throw error;
  }
}

// 메인 테스트 실행
async function runTests() {
  console.log(`${colors.green}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║         호텔 API 연계 테스트 시작                      ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════════════════╝${colors.reset}`);
  
  // Backend 서버 연결 테스트
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('🔌 Backend 서버 연결 테스트');
  
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/nearby?latitude=37.5665&longitude=126.9780&radius=1`, {
      method: 'GET',
    });
    if (response.ok) {
      log('Backend 서버 연결 성공', 'success');
    } else {
      throw new Error('서버 응답 오류');
    }
  } catch (error) {
    log('Backend 서버에 연결할 수 없습니다. 서버를 실행해주세요.', 'error');
    console.log('   실행 명령: cd backend && npm run start:dev');
    process.exit(1);
  }
  
  // 각 테스트 케이스 실행
  const results = [];
  for (const testCase of testCases) {
    const result = await testHotelAPI(testCase);
    results.push(result);
  }
  
  // Frontend 호환성 테스트
  try {
    await testFrontendCompatibility();
  } catch (error) {
    // 에러는 이미 로그됨
  }
  
  // 결과 요약
  console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('📊 테스트 결과 요약');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  
  if (failCount === 0) {
    console.log(`\n${colors.green}🎉 모든 테스트를 통과했습니다!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️ 일부 테스트가 실패했습니다.${colors.reset}`);
  }
}

// 테스트 실행
runTests().catch(error => {
  console.error(`${colors.red}테스트 실행 중 오류 발생:${colors.reset}`, error);
  process.exit(1);
});