const { test, expect } = require('@playwright/test');

test('메인 화면 시각적 회귀 테스트 (Visual Regression)', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 1. 게임 화면(Canvas)이 완전히 로딩될 때까지 대기
    const canvas = page.locator('canvas');
    await canvas.waitFor();
    
    // 로딩 직후 애니메이션이나 깜빡임이 안정화되도록 잠시 대기
    await page.waitForTimeout(1000);

    // 2. [핵심] 현재 화면을 스크린샷 찍어서 기존과 비교
    // 처음 실행하면 기준 이미지가 없어서 에러가 나지만, 이미지가 생성됩니다.
    // 두 번째 실행부터는 이 이미지와 비교합니다.
    await expect(page).toHaveScreenshot('main-game-screen.png', {
        maxDiffPixels: 100, // 100픽셀 정도의 미세한 차이는 허용 (게임은 렌더링 오차가 있을 수 있음)
        threshold: 0.2      // 색상 차이 민감도 조절
    });
});