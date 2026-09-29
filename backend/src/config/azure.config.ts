export const azureConfig = {
  clientId: process.env.AZURE_AD_CLIENT_ID || '',
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
  tenantId: process.env.AZURE_AD_TENANT_ID || '',
  redirectUri: process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:3000/api/auth/azure/callback',
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || ''}`,
};
