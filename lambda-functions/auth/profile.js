const { query } = require('../common/db');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    try {
        // 1. Get the User ID (Sub) from the Cognito Authorizer
        const claims = event.requestContext?.authorizer?.claims;
        if (!claims || !claims.sub) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                body: JSON.stringify({ message: 'Unauthorized: No claims found' })
            };
        }

        const cognitoUserId = claims.sub;
        console.log('Fetching profile for:', cognitoUserId);

        // 2. Query the Database for this user
        const result = await query(
            `SELECT id, email, name, role, institution_id, department_id, avatar_url 
       FROM users 
       WHERE cognito_user_id = $1`,
            [cognitoUserId]
        );

        // 3. Handle User Not Found (First time login?)
        if (result.rows.length === 0) {
            console.log('User not found in DB');
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                body: JSON.stringify({ message: 'User profile not found in database' })
            };
        }

        const user = result.rows[0];

        // 4. Return the User Profile (including ROLE)
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            body: JSON.stringify(user)
        };

    } catch (error) {
        console.error('Error fetching profile:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
