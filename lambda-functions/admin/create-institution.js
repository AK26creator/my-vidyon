const { query } = require('../common/db');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    try {
        const body = JSON.parse(event.body);
        const {
            name,
            type,
            address,
            city,
            state,
            contactEmail,
            contactPhone,
            academicYear,
            groups // Array of groups with classes and sections
        } = body;

        // 1. Insert Institution
        const instResult = await query(
            `INSERT INTO institutions (
                name, type, address, city, state, contact_email, contact_phone, academic_year, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active') RETURNING id`,
            [name, type, address, city, state, contactEmail, contactPhone, academicYear]
        );

        const institutionId = instResult.rows[0].id;

        // 2. Insert Classes/Groups if provided
        if (groups && groups.length > 0) {
            for (const group of groups) {
                // In this schema, 'groups' might be represented as Departments or just logical groupings
                // For now, let's treat groups as Departments if they have a name, 
                // or just iterative over classes.

                // Let's create a Department for each group
                const deptResult = await query(
                    `INSERT INTO departments (institution_id, name) VALUES ($1, $2) RETURNING id`,
                    [institutionId, group.name || 'General']
                );
                const departmentId = deptResult.rows[0].id;

                for (const cls of group.classes) {
                    for (const section of cls.sections) {
                        await query(
                            `INSERT INTO classes (institution_id, department_id, name, section, academic_year)
                             VALUES ($1, $2, $3, $4, $5)`,
                            [institutionId, departmentId, cls.name, section, academicYear]
                        );
                    }
                }
            }
        }

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({
                message: 'Institution created successfully',
                institutionId
            })
        };

    } catch (error) {
        console.error('Error creating institution:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};
