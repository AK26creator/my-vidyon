const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const studentCognitoId = event.requestContext.authorizer.claims.sub;
        const studentResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [studentCognitoId]);
        const studentId = studentResult.rows[0].id;

        const timetableQuery = `
            SELECT 
                t.day_of_week as day, 
                t.start_time as "startTime", 
                t.end_time as "endTime", 
                s.name as subject, 
                u.name as teacher,
                t.room_number as room
            FROM enrollments e
            JOIN timetables t ON e.class_id = t.class_id AND e.subject_id = t.subject_id
            JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN users u ON t.faculty_id = u.id
            WHERE e.student_id = $1
            ORDER BY t.day_of_week, t.start_time
        `;
        const result = await query(timetableQuery, [studentId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
