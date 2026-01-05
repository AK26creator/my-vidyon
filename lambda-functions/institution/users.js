const { query } = require('./common/db');
const {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));

    try {
        const body = JSON.parse(event.body);
        const { email, name, role, departmentId } = body;

        // Institution ID comes from the authorizer (Institution Admin's context)
        const adminInstitutionId = event.requestContext.authorizer.claims['custom:institutionId'] ||
            event.requestContext.authorizer.claims['institution_id'];

        if (!adminInstitutionId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Forbidden: Not associated with an institution" })
            };
        }

        // 1. Create User in Cognito
        const cognitoParams = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'name', Value: name },
                { Name: 'custom:role', Value: role },
                { Name: 'custom:institutionId', Value: adminInstitutionId },
                { Name: 'email_verified', Value: 'true' }
            ],
            TemporaryPassword: 'User123!' // Force change password on first login
        };

        const cognitoUser = await cognito.send(new AdminCreateUserCommand(cognitoParams));
        const cognitoUserId = cognitoUser.User.Attributes.find(attr => attr.Name === 'sub').Value;

        // 2. Insert into PostgreSQL
        await query(
            `INSERT INTO users (
                cognito_user_id, email, name, role, institution_id, department_id, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [cognitoUserId, email, name, role, adminInstitutionId, departmentId || null]
        );

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({
                message: 'User onboarded successfully',
                userId: cognitoUserId
            })
        };

    } catch (error) {
        console.error('Error onboarding user:', error);
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
