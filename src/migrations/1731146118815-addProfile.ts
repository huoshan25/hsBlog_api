import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfile1731146118815 implements MigrationInterface {
    name = 'AddProfile1731146118815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`profile\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`bio\` text NOT NULL, \`skills\` json NOT NULL, \`projects\` json NOT NULL, \`contacts\` json NOT NULL, \`seo\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`profile\``);
    }

}
