const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const facultyCognitoId = event.requestContext.authorizer.claims.sub;

        // 1. Get Faculty ID and Institution
        const facultyResult = await query('SELECT id, institution_id FROM users WHERE cognito_user_id = $1', [facultyCognitoId]);
        if (facultyResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Faculty not found' }) };
        }
        const facultyId = facultyResult.rows[0].id;
        const institutionId = facultyResult.rows[0].institution_id;

        if (method === 'GET') {
            const { classId, subjectId, examType } = event.queryStringParameters || {};

            if (!classId || !subjectId) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing classId or subjectId' }) };
            }

            // Fetch students enrolled in this class/subject and their grades for the specified examType
            const studentsQuery = `
                SELECT 
                    u.id, u.name, u.phone_number as "rollNo", 
                    g.marks_obtained as internal, 
                    g.total_marks as external,
                    (COALESCE(g.marks_obtained, 0) + COALESCE(g.total_marks, 0)) as total
                FROM users u
                JOIN enrollments e ON u.id = e.student_id
                LEFT JOIN grades g ON u.id = g.student_id AND g.subject_id = $1 AND g.exam_type = $2
                WHERE e.class_id = $3 AND e.institution_id = $4
            `;
            const studentsResult = await query(studentsQuery, [subjectId, examType || 'Internal', classId, institutionId]);

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(studentsResult.rows)
            };
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { subjectId, classId, examType, marks } = body;

            if (!marks || !Array.isArray(marks)) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid marks data' }) };
            }

            await query('BEGIN');
            for (const studentMark of marks) {
                const { studentId, internal, external } = studentMark;
                const total = (parseFloat(internal) || 0) + (parseFloat(external) || 0);

                await query(
                    `INSERT INTO grades (
                        student_id, subject_id, class_id, institution_id, exam_type, marks_obtained, total_marks, percentage
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (student_id, subject_id, exam_type) -- Assuming we add this unique constraint
                    DO UPDATE SET 
                        marks_obtained = EXCLUDED.marks_obtained,
                        total_marks = EXCLUDED.total_marks,
                        percentage = EXCLUDED.percentage,
                        updated_at = CURRENT_TIMESTAMP`,
                    [studentId, subjectId, classId, institutionId, examType || 'Internal', internal, external, total]
                );
            }
            await query('COMMIT');

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: 'Marks saved successfully' })
            };
        }

    } catch (error) {
        if (event.httpMethod === 'POST') await query('ROLLBACK');
        console.error('Error in faculty marks management:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
