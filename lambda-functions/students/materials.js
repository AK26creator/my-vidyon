const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const studentCognitoId = event.requestContext.authorizer.claims.sub;
        const studentResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [studentCognitoId]);
        const studentId = studentResult.rows[0].id;

        const materialsQuery = `
            SELECT 
                sm.id, sm.title, sm.description, sm.file_url as url, 
                sm.file_type as type, sm.created_at as "dateUploaded",
                s.name as subject, u.name as "uploadedBy"
            FROM enrollments e
            JOIN study_materials sm ON e.subject_id = sm.subject_id AND e.class_id = sm.class_id
            JOIN subjects s ON sm.subject_id = s.id
            JOIN users u ON sm.uploaded_by = u.id
            WHERE e.student_id = $1
            ORDER BY sm.created_at DESC
        `;
        const result = await query(materialsQuery, [studentId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
