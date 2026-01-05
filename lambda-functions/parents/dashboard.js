const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const parentCognitoId = event.requestContext.authorizer.claims.sub;

        // 1. Get Parent Database ID
        const parentResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [parentCognitoId]);
        if (parentResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Parent not found' }) };
        }
        const parentId = parentResult.rows[0].id;

        // 2. Get Linked Children with basic stats
        const childrenQuery = `
            SELECT 
                u.id, u.name, u.email, u.avatar_url,
                c.name as class_name, c.section,
                (SELECT ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END)) 
                 FROM attendance WHERE student_id = u.id) as attendance_rate,
                (SELECT ROUND(AVG(percentage)) 
                 FROM grades WHERE student_id = u.id) as overall_percentage
            FROM users u
            JOIN parent_student_relations psr ON u.id = psr.student_id
            JOIN enrollments e ON u.id = e.student_id
            JOIN classes c ON e.class_id = c.id
            WHERE psr.parent_id = $1
            GROUP BY u.id, c.name, c.section
        `;

        const childrenResult = await query(childrenQuery, [parentId]);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({ children: childrenResult.rows })
        };

    } catch (error) {
        console.error('Error fetching parent dashboard:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
