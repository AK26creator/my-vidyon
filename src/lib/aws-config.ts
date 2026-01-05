/**
 * AWS Configuration for My-Vidyon ERP
 * 
 * This file initializes AWS Amplify with Cognito and API Gateway configuration.
 * Import this file in main.tsx before rendering the app.
 */

import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  API: {
    REST: {
      [import.meta.env.VITE_API_NAME || 'MyVidyonERP']: {
        endpoint: import.meta.env.VITE_API_ENDPOINT || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET_NAME || '',
      region: import.meta.env.VITE_S3_REGION || import.meta.env.VITE_AWS_REGION || 'us-east-1',
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;
