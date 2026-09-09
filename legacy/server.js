// server.js
const express = require('express');
const mysql = require('mysql2/promise'); // 비동기 처리를 위한 promise 버전 사용
const cors = require('cors'); // CORS(Cross-Origin Resource Sharing) 허용을 위한 미들웨어

const app = express();
const port = 3000; // 백엔드 서버가 실행될 포트 번호

// CORS 설정: 모든 출처에서의 요청을 허용합니다. (개발 환경에서 편리)
app.use(cors());
// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// MySQL 연결 풀 설정
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // <-- 본인의 MySQL 사용자 이름으로 변경하세요!
    password: '1234', // <-- 본인의 MySQL 비밀번호로 변경하세요!
    database: 'my_schedule', // 이전에 생성한 데이터베이스 이름
    port: 3305, // MySQL 기본 포트
    waitForConnections: true,
    connectionLimit: 10, // 최대 연결 수
    queueLimit: 0
});

// 데이터베이스 연결 테스트
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to MySQL database!');
        connection.release(); // 연결 반환
    })
    .catch(err => {
        console.error('❌ Error connecting to MySQL database:', err);
        process.exit(1); // 데이터베이스 연결 실패 시 서버 종료
    });

// --- API 엔드포인트 정의 ---

// 1. 모든 시나리오 목록을 가져오는 엔드포인트 (탭 생성을 위해 사용)
app.get('/api/scenarios', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, scenario_name FROM scenarios ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        res.status(500).json({ message: 'Error fetching scenarios', error: error.message });
    }
});

// 2. 특정 시나리오의 모든 상세 데이터를 가져오는 엔드포인트
// (학기, 과목, 활동 정보를 포함하여 data.js와 유사한 구조로 반환)
app.get('/api/scenarios/:id', async (req, res) => {
    const scenarioId = req.params.id;
    try {
        // 시나리오 기본 정보 가져오기
        const [scenarioRows] = await pool.execute('SELECT id, scenario_name FROM scenarios WHERE id = ?', [scenarioId]);
        if (scenarioRows.length === 0) {
            return res.status(404).json({ message: 'Scenario not found' });
        }
        const scenario = scenarioRows[0];

        // 해당 시나리오의 학기 정보 가져오기
        const [semesterRows] = await pool.execute(
            'SELECT id, semester_name, original_index FROM semesters WHERE scenario_id = ? ORDER BY original_index',
            [scenarioId]
        );

        // 각 학기에 대한 과목 정보 가져오기
        const semestersWithCourses = await Promise.all(semesterRows.map(async (sem) => {
            const [courseRows] = await pool.execute(
                'SELECT id, semester_id, course_type AS type, course_name AS name, credit, course_order FROM courses WHERE semester_id = ? ORDER BY course_order',
                 [sem.id]
            );
            return {
                name: sem.semester_name,
                id: sem.id,
                originalIndex: sem.original_index,
                courses: courseRows
            };
        }));

        // 해당 시나리오의 활동 정보 가져오기
        const [activityRows] = await pool.execute(
            'SELECT id, activity_type AS type, activity_name AS name, start_semester_original_index AS startSem, end_semester_original_index AS endSem FROM activities WHERE scenario_id = ?',
            [scenarioId]
        );

        // data.js와 유사한 최종 데이터 구조 생성
        const fullScenarioData = {
            scenarioName: scenario.scenario_name,
            semesters: semestersWithCourses,
            activities: activityRows
        };
        res.json(fullScenarioData);

    } catch (error) {
        console.error(`Error fetching scenario ${scenarioId}:`, error);
        res.status(500).json({ message: `Error fetching scenario ${scenarioId}`, error: error.message });
    }
});

// 3. 과목 추가 API
app.post('/api/courses', async (req, res) => {
    const { semester_id, course_type, course_name, credit } = req.body;
    if (!semester_id || !course_type || course_name == null || credit == null) {
        return res.status(400).json({ message: 'semester_id, course_type, course_name, credit가 필요합니다.' });
    }

    try {
        // 해당 학기의 가장 큰 course_order 값을 찾아서 1을 더함
        const [[{ max_order }]] = await pool.execute(
            'SELECT COALESCE(MAX(course_order), -1) as max_order FROM courses WHERE semester_id = ?',
            [semester_id]
        );
        const new_order = max_order + 1;

        const [result] = await pool.execute(
            'INSERT INTO courses (semester_id, course_type, course_name, credit, course_order) VALUES (?, ?, ?, ?, ?)',
            [semester_id, course_type, course_name, credit, new_order]
        );

        const [rows] = await pool.execute(
            'SELECT id, semester_id, course_type AS type, course_name AS name, credit, course_order FROM courses WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
});

// 4. 과목 수정 API
app.put('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const { semester_id, course_type, course_name, credit } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE courses SET semester_id = ?, course_type = ?, course_name = ?, credit = ? WHERE id = ?',
            [semester_id, course_type, course_name, credit, courseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const [rows] = await pool.execute(
            'SELECT id, semester_id, course_type AS type, course_name AS name, credit FROM courses WHERE id = ?',
            [courseId]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// 5. 과목 삭제 API
app.delete('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    try {
        const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [courseId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

// 6. 학기 내 과목 순서 업데이트 API
app.put('/api/semesters/:id/courses/order', async (req, res) => {
    const semesterId = req.params.id;
    const orderedCourseIds = req.body; // e.g., [3, 1, 2]

    if (!Array.isArray(orderedCourseIds)) {
        return res.status(400).json({ message: 'Request body must be an array of course IDs.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Promise.all로 동시에 실행하면 데드락 위험이 있으므로 for-of 루프로 순차 실행
        let index = 0;
        for (const courseId of orderedCourseIds) {
            await connection.execute(
                'UPDATE courses SET course_order = ? WHERE id = ? AND semester_id = ?',
                [index, courseId, semesterId]
            );
            index++;
        }

        await connection.commit();
        res.json({ message: `Course order for semester ${semesterId} updated successfully.` });
    } catch (error) {
        await connection.rollback();
        console.error(`Error updating course order for semester ${semesterId}:`, error);
        res.status(500).json({ message: 'Error updating course order', error: error.message });
    } finally {
        connection.release();
    }
});

// 7. 활동 추가 API
app.post('/api/activities', async (req, res) => {
    const { scenario_id, activity_type, activity_name, start_sem, end_sem } = req.body;
    if (!scenario_id || !activity_type || !activity_name) {
        return res.status(400).json({ message: 'scenario_id, activity_type, activity_name이 필요합니다.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO activities (scenario_id, activity_type, activity_name, start_semester_original_index, end_semester_original_index) VALUES (?, ?, ?, ?, ?)',
            [scenario_id, activity_type, activity_name, start_sem, end_sem]
        );
        res.status(201).json({ id: result.insertId, message: 'Activity created' });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: 'Error creating activity', error: error.message });
    }
});

// 8. 활동 수정 API
app.put('/api/activities/:id', async (req, res) => {
    const activityId = req.params.id;
    const { activity_type, activity_name, start_sem, end_sem } = req.body;
    try {
        const [result] = await pool.execute(
            'UPDATE activities SET activity_type = ?, activity_name = ?, start_semester_original_index = ?, end_semester_original_index = ? WHERE id = ?',
            [activity_type, activity_name, start_sem, end_sem, activityId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json({ message: 'Activity updated' });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ message: 'Error updating activity', error: error.message });
    }
});

// 9. 활동 삭제 API
app.delete('/api/activities/:id', async (req, res) => {
    const activityId = req.params.id;
    try {
        const [result] = await pool.execute('DELETE FROM activities WHERE id = ?', [activityId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: 'Error deleting activity', error: error.message });
    }
});

// --- 서버 시작 ---
app.listen(port, () => {
    console.log(`🚀 Backend server listening at http://localhost:${port}`);
});
