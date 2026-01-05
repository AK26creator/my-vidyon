const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const { studentId } = event.pathParameters || {};
        const parentCognitoId = event.requestContext.authorizer.claims.sub;

        if (!studentId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing studentId' }) };

        // 1. Verify Parent-Student Relation
        const relationResult = await query(`
            SELECT psr.id 
            FROM parent_student_relations psr
            JOIN users u ON psr.parent_id = u.id
            WHERE u.cognito_user_id = $1 AND psr.student_id = $2
        `, [parentCognitoId, studentId]);

        if (relationResult.rows.length === 0) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Access denied: You are not linked to this student' }) };
        }

        // 2. Fetch Child Details (Attendance, Grades)
        const childInfo = await query('SELECT name, email, avatar_url FROM users WHERE id = $1', [studentId]);

        const attendance = await query(`
            SELECT attendance_date as date, status 
            FROM attendance 
            WHERE student_id = $1 
            ORDER BY attendance_date DESC LIMIT 5
        `, [studentId]);

        const grades = await query(`
            SELECT s.name as subject, g.exam_type as type, g.marks_obtained as score, g.total_marks as max
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            WHERE g.student_id = $1
            ORDER BY g.exam_date DESC LIMIT 5
        `, [studentId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                profile: childInfo.rows[0],
                recentAttendance: attendance.rows,
                recentGrades: grades.rows
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
