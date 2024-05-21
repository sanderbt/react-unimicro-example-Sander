export const API_BASE_URL = 'https://test.unimicro.no/api/';

export const OIDC_CONFIG = {
    authority: 'https://test-login.softrig.com',
    client_id: 'a5e13ed9-6c0e-4994-aa01-ab88cfabe5e2',
    scope: 'AppFramework openid profile',
    redirect_uri: location.origin,
    post_logout_redirect_uri: location.origin,
    silent_redirect_uri: location.origin,
};

