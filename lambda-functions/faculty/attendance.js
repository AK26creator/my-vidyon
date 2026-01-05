const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { subjectId, classId, attendanceDate, students } = body;

        // Faculty ID from authorizer
        const facultyCognitoId = event.requestContext.authorizer.claims.sub;

        // Get internal DB ID for faculty
        const facultyResult = await query('SELECT id, institution_id FROM users WHERE cognito_user_id = $1', [facultyCognitoId]);
        const facultyId = facultyResult.rows[0].id;
        const institutionId = facultyResult.rows[0].institution_id;

        // Transactional insert for attendance
        await query('BEGIN');

        for (const student of students) {
            await query(
                `INSERT INTO attendance (
                    student_id, subject_id, class_id, institution_id, attendance_date, status, marked_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (student_id, subject_id, attendance_date) 
                DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP`,
                [student.id, subjectId, classId, institutionId, attendanceDate, student.status, facultyId]
            );
        }

        await query('COMMIT');

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({ message: 'Attendance marked successfully' })
        };

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error marking attendance:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
