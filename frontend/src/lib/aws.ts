import { Amplify } from "aws-amplify";

let isConfigured = false;

export function configureAmplify(region?: string): boolean {
  const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID;
  const defaultRegion = import.meta.env.VITE_AWS_REGION || "eu-west-1";

  if (!identityPoolId) {
    return false;
  }

  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          identityPoolId,
          allowGuestAccess: true,
        },
      },
    });
    isConfigured = true;
    return true;
  } catch (error) {
    console.error("Failed to configure AWS Amplify:", error);
    return false;
  }
}

export function hasCognitoConfigured(): boolean {
  return Boolean(import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID);
}

