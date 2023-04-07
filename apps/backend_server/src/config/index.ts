import { cleanEnv, port, str, url, email } from 'envalid';

export const config = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging', 'qa'],
    }),
    NESTJS_EVENT_WEBHOOK_SHARED_SECRET: str(),
    HASURA_GRAPHQL_API_ENDPOINT: str(),
    HASURA_GRAPHQL_ADMIN_SECRET: str(),
    PORT: port({ default: 3000 }),
    OPENID_CLIENT_PROVIDER_OIDC_ISSUER: str(),
    OPENID_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI: url(),
    OPENID_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI: url(),
    OPENID_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET: str(),
    OPENID_CLIENT_REGISTRATION_LOGIN_CLIENT_ID: str(),
    OPENID_CLIENT_PROVIDER_JWK_URL: url(),
    COOKIE_SECRET: str(),
    SESSION_SECRET: str(),
    EMAIL_HOST: str({ devDefault: 'localhost' }),
    EMAIL_USERNAME: str(),
    EMAIL_PASSWORD: str(),
    EMAIL_SENDER_ID: email({ devDefault: 'admin@localhost.com' }),
});

export default config;
