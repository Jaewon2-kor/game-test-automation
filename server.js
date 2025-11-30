const express = require('express');
const app = express();
const path = require('path');

// [중요] 이 줄이 없으면 req.body가 undefined가 되어 500 에러가 납니다!
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/init', (req, res) => {
    res.json({ start_gold: 100, status: 'ready' });
});

app.post('/api/action', (req, res) => {
    try {
        // 1. 요청 데이터가 잘 왔는지 서버 로그로 확인
        console.log('[Server] 받은 데이터:', req.body);

        // 2. 방어 코드: req.body가 비어있으면 에러 처리
        if (!req.body || typeof req.body.score === 'undefined') {
            throw new Error("클라이언트로부터 'score' 데이터가 오지 않았습니다!");
        }

        // 3. 정상 응답
        res.json({ 
            success: true, 
            server_score: req.body.score,
            increment: 10,
            timestamp: Date.now()
        });

    } catch (error) {
        // 4. 에러가 나면 서버가 죽지 않고 원인을 출력함
        console.error('🔥 [500 에러 발생 원인]:', error.message);
        console.error(error.stack);
        
        res.status(500).json({ 
            error: 'Server Error', 
            details: error.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Game Server running at http://localhost:${PORT}`);
});