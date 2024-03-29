import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { gql } from 'graphql-request';
import { IncomingMessage } from 'http';
import {
    AuthorizationParameters,
    Client,
    Issuer,
    OpenIDCallbackChecks,
    UserinfoResponse,
} from 'openid-client';

import { config } from '../config/index';
import { GqlSdk, InjectSdk } from '../sdk/sdk.module';
import { CreateUserDto } from './dto/create-user.dto';

gql`
    mutation createUser($input: users_insert_input!) {
        insert_users_one(object: $input) {
            id
            email
            name
            phone
            created_at
        }
    }

    mutation updateUserById($id: uuid!, $input: users_set_input!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: $input) {
            email
            id
            name
            phone
        }
    }

    query findUserByEmail($email: citext!) {
        users(where: { email: { _eq: $email } }) {
            id
            name
            phone
            created_at
        }
    }

    query findUserById($id: uuid!) {
        users_by_pk(id: $id) {
            id
            name
            email
            phone
            created_at
        }
    }
`;

export interface LoginUserArgs {
    email: string;
    password: string;
}

export interface RegisterUserArgs {
    email: string;
    displayName?: string;
    password: string;
}

export interface LoginOrRegisterUserOutput {
    token?: string;
    error?: string;
}

export interface HasuraJwtClaims<CustomClaims extends Record<string, string | string[]> = {}> {
    'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': string;
        'x-hasura-allowed-roles': string[];
    } & CustomClaims;
}

export type UserJwtClaims = HasuraJwtClaims<{ 'x-hasura-user-id': string }>;

export interface IUserInfo {
    sub: string;
    email_verified: boolean;
    'https://hasura.io/jwt/claims': HTTPSHasuraIoJwtClaims;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}

export interface HTTPSHasuraIoJwtClaims {
    'x-hasura-default-role': string;
    'x-hasura-user-id': string;
    'x-hasura-allowed-roles': string[];
}

export const buildOpenIdClient = async () => {
    const TrustIssuer = await Issuer.discover(
        `${config.OPENID_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`
    );
    return new TrustIssuer.Client({
        client_id: config.OPENID_CLIENT_REGISTRATION_LOGIN_CLIENT_ID,
        client_secret: config.OPENID_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET,
    });
};

@Injectable()
export class AuthService {
    openIdClient: Client;
    private readonly logger = new Logger(AuthService.name);

    constructor(@InjectSdk() private readonly sdk: GqlSdk, @Inject('OIDC') openIdClient: Client) {
        this.openIdClient = openIdClient;
    }

    async getUserInfo(accessToken: string): Promise<UserinfoResponse> {
        const userinfo: UserinfoResponse = await this.openIdClient.userinfo(accessToken);
        // this.logger.log(userinfo);
        return userinfo;
    }

    async callback(request: IncomingMessage, checks: OpenIDCallbackChecks) {
        const params = this.openIdClient.callbackParams(request);

        return await this.openIdClient.callback(
            config.OPENID_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI,
            params,
            checks
        );
    }

    getAuthorizationUrl(params: AuthorizationParameters) {
        return this.openIdClient.authorizationUrl(params);
    }

    refreshToken(refreshToekn: string) {
        return this.openIdClient.refresh(refreshToekn);
    }

    public async createOrUpdateUser(input: CreateUserDto) {
        let name = input.name;
        if (name?.length < 1) {
            name = input.email.split('@')[0];
        }
        try {
            const { insert_users_one } = await this.sdk.createUser({
                input: {
                    id: input.id,
                    email: input.email,
                    name,
                },
            });
            this.logger.log(insert_users_one);
        } catch (error) {
            if (error.message.includes('Uniqueness violation')) {
                this.sdk.updateUserById({
                    id: input.id,
                    input: { ...input, name },
                });
            } else {
                this.logger.error(error);
            }
        }

        return;
    }

    // /**
    //  * findUser
    //  */
    public findUser(id: string) {
        return this.sdk.findUserById({ id });
    }
}
