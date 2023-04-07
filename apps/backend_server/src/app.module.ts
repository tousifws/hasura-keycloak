import { HasuraModule } from '@golevelup/nestjs-hasura';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { SdkModule } from './sdk/sdk.module';

@Module({
    imports: [
        SdkModule,
        AuthModule,
        GraphQLModule.forRoot<MercuriusDriverConfig>({
            driver: MercuriusDriver,
            graphiql: true,
            autoSchemaFile: true,
            allowBatchedQueries: true,
        }),
        HasuraModule.forRootAsync(HasuraModule, {
            useFactory: () => {
                const webhookSecret = config.NESTJS_EVENT_WEBHOOK_SHARED_SECRET;

                return {
                    webhookConfig: {
                        secretFactory: webhookSecret,
                        secretHeader: 'nestjs-event-webhook',
                    },
                    managedMetaDataConfig: config.isDev
                        ? {
                              metadataVersion: 'v3',
                              dirPath: join(process.cwd(), '../hasura/metadata'),
                              nestEndpointEnvName: 'NESTJS_EVENT_WEBHOOK_ENDPOINT',
                              secretHeaderEnvName: 'NESTJS_EVENT_WEBHOOK_SHARED_SECRET',
                              defaultEventRetryConfig: {
                                  numRetries: 3,
                                  timeoutInSeconds: 100,
                                  intervalInSeconds: 30,
                                  toleranceSeconds: 21600,
                              },
                          }
                        : undefined,
                };
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
