import { Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
});

const userIds = [...Array(10).keys()].map(() => ({
    id: randomUUID(),
}));

async function main() {
    await db
        .insertInto('users')
        .values(
            userIds.map(({ id }) => ({
                id,
                email: faker.internet.email(),
                name: faker.name.fullName(),
                phone: faker.phone.number(),
            }))
        )
        .execute();

    await db
        .insertInto('posts')
        .values(
            userIds.map(({ id }) => ({
                author: id,
                published: faker.datatype.boolean(),
                title: faker.random.words(5),
                content: faker.random.words(15),
            }))
        )
        .execute();
}

main().catch(async (e) => {
    console.error(e);
    process.exit(1);
});
