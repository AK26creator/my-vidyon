const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const instId = event.requestContext.authorizer.claims['custom:institutionId'] ||
            event.requestContext.authorizer.claims['institution_id'];

        const summaryQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE institution_id = $1 AND role = 'student') as "totalStudents",
                (SELECT COUNT(*) FROM users WHERE institution_id = $1 AND role = 'faculty') as "totalFaculty",
                (SELECT COUNT(*) FROM departments WHERE institution_id = $1) as "totalDepartments",
                (SELECT COALESCE(SUM(paid_amount), 0) FROM student_fee_assignments sfa 
                 JOIN fee_structures fs ON sfa.structure_id = fs.id 
                 WHERE fs.institution_id = $1) as "totalRevenue"
        `;
        const result = await query(summaryQuery, [instId]);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
