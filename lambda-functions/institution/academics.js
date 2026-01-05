const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { action, name, description, departmentId, section, academicYear } = body;

        const instId = event.requestContext.authorizer.claims['custom:institutionId'] ||
            event.requestContext.authorizer.claims['institution_id'];

        if (!instId) return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };

        let result;
        switch (action) {
            case 'CREATE_DEPARTMENT':
                result = await query(
                    'INSERT INTO departments (institution_id, name, description) VALUES ($1, $2, $3) RETURNING *',
                    [instId, name, description]
                );
                break;

            case 'CREATE_CLASS':
                result = await query(
                    'INSERT INTO classes (institution_id, department_id, name, section, academic_year) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [instId, departmentId, name, section, academicYear]
                );
                break;

            case 'GET_ACADEMIC_DATA':
                const depts = await query('SELECT * FROM departments WHERE institution_id = $1', [instId]);
                const classes = await query('SELECT * FROM classes WHERE institution_id = $1', [instId]);
                result = { departments: depts.rows, classes: classes.rows };
                break;

            default:
                return { statusCode: 400, body: JSON.stringify({ message: "Invalid action" }) };
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization" },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Error in academic management:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
