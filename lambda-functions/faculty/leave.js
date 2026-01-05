const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const facultyCognitoId = event.requestContext.authorizer.claims.sub;
        const facultyResult = await query('SELECT id, institution_id FROM users WHERE cognito_user_id = $1', [facultyCognitoId]);
        const facultyId = facultyResult.rows[0].id;
        const institutionId = facultyResult.rows[0].institution_id;

        if (method === 'GET') {
            const result = await query(
                'SELECT id, leave_type as type, start_date as "startDate", end_date as "endDate", status, reason FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC',
                [facultyId]
            );
            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.rows)
            };
        }

        if (method === 'POST') {
            const { type, startDate, endDate, reason } = JSON.parse(event.body);
            const result = await query(
                'INSERT INTO leave_requests (user_id, institution_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [facultyId, institutionId, type, startDate, endDate, reason]
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
