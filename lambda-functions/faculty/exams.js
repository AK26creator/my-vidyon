const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const facultyCognitoId = event.requestContext.authorizer.claims.sub;
        const facultyResult = await query('SELECT id, institution_id FROM users WHERE cognito_user_id = $1', [facultyCognitoId]);
        const facultyId = facultyResult.rows[0].id;
        const institutionId = facultyResult.rows[0].institution_id;

        if (method === 'GET') {
            const result = await query(`
                SELECT 
                    g.id, s.name as subject, c.name || '-' || c.section as class, 
                    g.exam_type as type, g.exam_date as date
                FROM grades g
                JOIN subjects s ON g.subject_id = s.id
                JOIN classes c ON g.class_id = c.id
                WHERE g.institution_id = $1 AND g.exam_date >= CURRENT_DATE
                GROUP BY g.id, s.name, c.name, c.section, g.exam_type, g.exam_date
                ORDER BY g.exam_date ASC
            `, [institutionId]);
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows)
            };
        }

        if (method === 'POST') {
            const { subjectId, classId, type, date } = JSON.parse(event.body);
            // In this schema, exams are implicitly created when grades are assigned or scheduled.
            // For now, let's just insert a "template" grade record to signify a scheduled exam.
            const result = await query(
                'INSERT INTO grades (institution_id, subject_id, class_id, exam_type, exam_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [institutionId, subjectId, classId, type, date]
            );
            return {
                statusCode: 201,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows[0])
            };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
