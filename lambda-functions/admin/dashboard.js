const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const summaryQuery = `
            SELECT 
                (SELECT COUNT(*) FROM institutions) as "totalInstitutions",
                (SELECT COUNT(*) FROM users) as "totalUsers",
                (SELECT COUNT(*) FROM users WHERE role = 'student') as "totalStudents",
                (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments) as "totalRevenue",
                (SELECT COUNT(*) FROM institutions WHERE subscription_status = 'active') as "activeSubscriptions"
        `;
        const result = await query(summaryQuery);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
