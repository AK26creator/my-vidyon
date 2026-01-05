const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const cognitoId = event.requestContext.authorizer.claims.sub;
        const facultyResult = await query('SELECT id FROM users WHERE cognito_user_id = $1', [cognitoId]);
        const facultyId = facultyResult.rows[0].id;

        const summaryQuery = `
            SELECT 
                (SELECT COUNT(*) FROM faculty_assignments WHERE faculty_id = $1) as courses,
                (SELECT COUNT(*) FROM assignments WHERE faculty_id = $1 AND due_date > CURRENT_TIMESTAMP) as "activeAssignments",
                (SELECT COUNT(*) FROM leave_requests WHERE user_id = $1 AND status = 'pending') as "pendingLeaves"
        `;
        const result = await query(summaryQuery, [facultyId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
