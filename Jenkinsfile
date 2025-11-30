pipeline {
    agent any

    tools {
        // 아까 1단계에서 설정한 이름 'NodeJS'와 똑같아야 합니다.
        nodejs 'NodeJS' 
    }

    stages {
        stage('Install Dependencies') {
            steps {
                // 의존성 설치
                sh 'npm ci'
            }
        }

        stage('Install Browsers') {
            steps {
                // Playwright 브라우저 다운로드
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Test') {
            steps {
                // 서버 실행 -> 테스트 -> 리포트 생성
                // (Visual Regression 스냅샷이 없으면 첫 실행은 실패할 수 있음)
                sh 'npx playwright test --reporter=html'
            }
        }
    }

    post {
        always {
            // HTML 리포트를 젠킨스에 게시 (HTML Publisher 플러그인 필요)
            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}