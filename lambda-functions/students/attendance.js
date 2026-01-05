const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const studentCognitoId = event.requestContext.authorizer.claims.sub;
        const studentResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [studentCognitoId]);
        const studentId = studentResult.rows[0].id;

        const attendanceQuery = `
            SELECT 
                a.attendance_date as date, 
                a.status, 
                s.name as subject,
                s.code as "subjectCode"
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.student_id = $1
            ORDER BY a.attendance_date DESC
        `;
        const result = await query(attendanceQuery, [studentId]);

        // Aggregate summary
        const summaryQuery = `
            SELECT 
                COUNT(*) as total_classes,
                COUNT(*) FILTER (WHERE status = 'present') as present_days,
                ROUND(COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as percentage
            FROM attendance
            WHERE student_id = $1
        `;
        const summaryResult = await query(summaryQuery, [studentId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                summary: summaryResult.rows[0],
                history: result.rows
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
