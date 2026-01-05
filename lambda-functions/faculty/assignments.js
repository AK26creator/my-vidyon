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
            // List assignments with submission counts
            const assignmentsQuery = `
                SELECT 
                    a.id, a.title, s.name as subject, c.name || '-' || c.section as class, 
                    a.due_date as "dueDate", a.total_marks as points,
                    (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) || '/' || 
                    (SELECT COUNT(*) FROM enrollments WHERE class_id = a.class_id AND subject_id = a.subject_id) as submissions,
                    CASE WHEN a.due_date > CURRENT_TIMESTAMP THEN 'active' ELSE 'closed' END as status
                FROM assignments a
                JOIN subjects s ON a.subject_id = s.id
                JOIN classes c ON a.class_id = c.id
                WHERE a.faculty_id = $1 AND a.institution_id = $2
                ORDER BY a.created_at DESC
            `;
            const result = await query(assignmentsQuery, [facultyId, institutionId]);
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows)
            };
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { title, description, dueDate, totalMarks, subjectId, classId } = body;

            const result = await query(
                `INSERT INTO assignments (
                    faculty_id, institution_id, subject_id, class_id, title, description, due_date, total_marks
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [facultyId, institutionId, subjectId, classId, title, description, dueDate, totalMarks || 100]
            );

            return {
                statusCode: 201,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows[0])
            };
        }

    } catch (error) {
        console.error('Error in faculty assignments management:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
