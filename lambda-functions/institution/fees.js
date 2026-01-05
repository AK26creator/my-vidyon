const { query } = require('./common/db');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    try {
        const method = event.httpMethod;
        const institutionId = event.requestContext.authorizer.claims['custom:institutionId'] ||
            event.requestContext.authorizer.claims['institution_id'];

        if (!institutionId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Forbidden: Not associated with an institution" })
            };
        }

        if (method === 'GET') {
            // 1. Fetch Metrics
            const metricsQuery = `
                SELECT 
                    COALESCE(SUM(paid_amount), 0) as total_revenue,
                    COALESCE(SUM(net_amount - paid_amount), 0) as total_outstanding,
                    COALESCE(SUM(discount_amount), 0) as total_scholarships
                FROM student_fee_assignments
                WHERE structure_id IN (SELECT id FROM fee_structures WHERE institution_id = $1)
            `;
            const metricsResult = await query(metricsQuery, [institutionId]);
            const metrics = metricsResult.rows[0];

            // 2. Fetch Fee Structures
            const structuresQuery = `
                SELECT 
                    fs.id, fs.name as category, fs.total_amount as amount, 
                    fs.updated_at as lastUpdated, 'active' as status,
                    'Annual' as frequency -- Frequency can be added to DB if needed
                FROM fee_structures fs
                WHERE fs.institution_id = $1
                ORDER BY fs.created_at DESC
            `;
            const structuresResult = await query(structuresQuery, [institutionId]);

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    metrics: {
                        totalRevenue: parseFloat(metrics.total_revenue),
                        outstanding: parseFloat(metrics.total_outstanding),
                        scholarships: parseFloat(metrics.total_scholarships),
                        refunds: 0 // Refund logic can be added later
                    },
                    feeStructures: structuresResult.rows
                })
            };
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { action, name, amount, academicYear, classId, categoryId } = body;

            if (action === 'ADD_CATEGORY') {
                const result = await query(
                    'INSERT INTO fee_categories (institution_id, name) VALUES ($1, $2) RETURNING *',
                    [institutionId, name]
                );
                return {
                    statusCode: 201,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(result.rows[0])
                };
            }

            if (action === 'ADD_STRUCTURE') {
                const result = await query(
                    `INSERT INTO fee_structures (institution_id, class_id, name, academic_year, total_amount) 
                     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                    [institutionId, classId, name, academicYear, amount]
                );
                return {
                    statusCode: 201,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify(result.rows[0])
                };
            }
        }

        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" })
        };

    } catch (error) {
        console.error('Error in fees management:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
