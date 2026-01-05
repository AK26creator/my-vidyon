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

        // 2. Fetch Fee Records for all children
        const feesQuery = `
            SELECT 
                sfa.id, 
                u.name as student, 
                fs.name as type, 
                sfa.net_amount as amount, 
                sfa.due_date as "dueDate", 
                sfa.status,
                (SELECT payment_date FROM fee_payments WHERE assignment_id = sfa.id ORDER BY payment_date DESC LIMIT 1) as "paymentDate",
                (SELECT receipt_no FROM fee_payments WHERE assignment_id = sfa.id ORDER BY payment_date DESC LIMIT 1) as invoice
            FROM student_fee_assignments sfa
            JOIN fee_structures fs ON sfa.structure_id = fs.id
            JOIN users u ON sfa.student_id = u.id
            JOIN parent_student_relations psr ON u.id = psr.student_id
            WHERE psr.parent_id = $1
            ORDER BY sfa.due_date ASC
        `;

        const feesResult = await query(feesQuery, [parentId]);

        // 3. Calculate Summary Metrics
        let totalDue = 0;
        let paidThisYear = 0;

        feesResult.rows.forEach(fee => {
            if (fee.status !== 'paid') {
                totalDue += parseFloat(fee.amount);
            } else {
                paidThisYear += parseFloat(fee.amount);
            }
        });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({
                metrics: {
                    totalDue,
                    paidThisYear
                },
                fees: feesResult.rows
            })
        };

    } catch (error) {
        console.error('Error fetching parent fees:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
