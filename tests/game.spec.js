const { test, expect } = require('@playwright/test');

test('QA 최종: 동적 좌표 + 상태코드 + 패킷 데이터(10) 정밀 검증', async ({ page }) => {
    
    // 1. 게임 접속
    await page.goto('http://localhost:3000');
    const canvas = page.locator('canvas');
    await canvas.waitFor();
    await page.waitForFunction(() => window.testObjects?.attackBtn !== undefined);

    // 2. 좌표 계산 (Dynamic Positioning)
    const buttonBounds = await page.evaluate(() => {
        const btn = window.testObjects.attackBtn;
        if (!btn.visible) return null;
        return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
    });
    expect(buttonBounds).not.toBeNull();

    const canvasBox = await canvas.boundingBox();
    const realX = canvasBox.x + buttonBounds.x + (buttonBounds.width / 2);
    const realY = canvasBox.y + buttonBounds.y + (buttonBounds.height / 2);

    console.log(`\n🔎 [테스트 준비] 타겟 좌표 계산: (${realX}, ${realY})`);

    // 3. 반복 클릭 및 정밀 패킷 검증
    const CLICK_COUNT = 10;
    console.log(`🚀 ${CLICK_COUNT}회 반복 테스트 시작 (패킷 내 'increment: 10' 검증)\n`);

    for (let i = 1; i <= CLICK_COUNT; i++) {
        // (A) 응답 대기 설정
        const responsePromise = page.waitForResponse(resp => 
            resp.url().includes('/api/action') && resp.request().method() === 'POST'
        );

        // (B) 물리적 클릭
        await page.mouse.click(realX, realY);

        // (C) 응답 수신 및 상태 코드 검사
        const response = await responsePromise;
        
        if (response.status() !== 200) {
            console.error(`🚨 통신 에러 발생: Status ${response.status()}`);
            expect(response.status()).toBe(200);
        }

        // (D) [요청하신 기능] 패킷 데이터 뜯어보기
        const packetData = await response.json();

        // "서버가 보낸 패킷에 increment: 10 이라고 적혀있는가?"
        if (packetData.increment !== 10) {
            console.error(`❌ 데이터 무결성 실패: 10을 기대했으나 ${packetData.increment}를 받음`);
        }
        
        // 실제 검증 (다르면 여기서 테스트 멈춤)
        expect(packetData.increment).toBe(10);

        console.log(`   ✅ [${i}/${CLICK_COUNT}] 패킷 검증 성공: 증가량(${packetData.increment}) / 총점(${packetData.server_score})`);

        // 사람처럼 0.1초 대기
        await page.waitForTimeout(100);
    }

    console.log(`\n🎉 모든 패킷 데이터(10) 검증 완료!`);
});