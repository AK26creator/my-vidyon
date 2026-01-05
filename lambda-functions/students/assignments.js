const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const studentCognitoId = event.requestContext.authorizer.claims.sub;

        // 1. Get Student ID
        const studentResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [studentCognitoId]);
        if (studentResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Student not found' }) };
        }
        const studentId = studentResult.rows[0].id;

        if (method === 'GET') {
            // Fetch assignments for the student's enrolled subjects with submission status
            const queryText = `
                SELECT 
                    a.id, a.title, s.name as course, a.due_date as "dueDate",
                    CASE 
                        WHEN asub.status IS NOT NULL THEN asub.status
                        WHEN a.due_date < CURRENT_TIMESTAMP THEN 'overdue'
                        ELSE 'pending'
                    END as status,
                    asub.marks_obtained as grade,
                    a.total_marks as "maxGrade"
                FROM enrollments e
                JOIN assignments a ON e.subject_id = a.subject_id AND e.class_id = a.class_id
                JOIN subjects s ON a.subject_id = s.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = $1
                WHERE e.student_id = $1
                ORDER BY a.due_date ASC
            `;
            const result = await query(queryText, [studentId]);

            // Group by status for the frontend tabs if needed, or just return flat
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows)
            };
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { assignmentId, content, files } = body;

            const result = await query(
                `INSERT INTO assignment_submissions (
                    assignment_id, student_id, content, submission_files, status
                ) VALUES ($1, $2, $3, $4, 'submitted')
                ON CONFLICT (assignment_id, student_id)
                DO UPDATE SET 
                    content = EXCLUDED.content,
                    submission_files = EXCLUDED.submission_files,
                    submission_date = CURRENT_TIMESTAMP,
                    status = 'submitted'
                RETURNING *`,
                [assignmentId, studentId, content, files]
            );

            return {
                statusCode: 201,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows[0])
            };
        }

    } catch (error) {
        console.error('Error in student assignments management:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
