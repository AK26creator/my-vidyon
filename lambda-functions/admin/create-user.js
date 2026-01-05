/**
 * Lambda function: Admin Create User
 * Endpoint: POST /admin/users
 * 
 * Description:
 * 1. Checks if the requester is an Admin in the DB
 * 2. Creates the user in AWS Cognito (sends temp password email)
 * 3. Creates the user in PostgreSQL
 */

const { query } = require('../common/db');
const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    try {
        const body = JSON.parse(event.body || '{}');
        const { email, name, role, institution_id, department_id } = body;

        // Validation
        if (!email || !name || !role || !institution_id) {
            return errorResponse(400, 'Missing required fields: email, name, role, institution_id');
        }

        // 1. Verify Requester is Admin
        const requesterId = event.requestContext?.authorizer?.claims?.sub;
        if (!requesterId) return errorResponse(401, 'Unauthorized');

        const requesterResult = await query(
            'SELECT role FROM users WHERE cognito_user_id = $1',
            [requesterId]
        );

        if (requesterResult.rows.length === 0 || requesterResult.rows[0].role !== 'admin') {
            return errorResponse(403, 'Forbidden: Only admins can create users');
        }

        // 2. Create User in Cognito
        console.log(`Creating Cognito user: ${email}`);
        const userPoolId = process.env.COGNITO_USER_POOL_ID; // Must be set in Lambda env vars!

        const createCommand = new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'name', Value: name },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'custom:institutionId', Value: institution_id }
            ],
            DesiredDeliveryMediums: ['EMAIL'], // Sends the temporary password via email
            ForceAliasCreation: false
        });

        const cognitoResult = await client.send(createCommand);
        const newCognitoUserId = cognitoResult.User.Username; // This is the Sub (UUID)

        console.log(`Cognito user created: ${newCognitoUserId}`);

        // 3. Create User in Database
        console.log('Inserting into DB...');
        const insertQuery = `
            INSERT INTO users (cognito_user_id, email, name, role, institution_id, department_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            RETURNING id
        `;

        await query(insertQuery, [newCognitoUserId, email, name, role, institution_id, department_id || null]);

        return {
            statusCode: 201,
            headers: corsHeaders(),
            body: JSON.stringify({
                message: 'User created successfully',
                userId: newCognitoUserId,
                email: email
            })
        };

    } catch (error) {
        console.error('Error creating user:', error);

        // Handle "User already exists" properly
        if (error.name === 'UsernameExistsException') {
            return errorResponse(409, 'User with this email already exists');
        }

        return errorResponse(500, error.message);
    }
};

function errorResponse(code, message) {
    return {
        statusCode: code,
        headers: corsHeaders(),
        body: JSON.stringify({ error: message })
    };
}

function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };
}
