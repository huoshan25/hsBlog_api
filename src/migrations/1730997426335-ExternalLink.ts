import { MigrationInterface, QueryRunner } from "typeorm";

export class ExternalLink1730997426335 implements MigrationInterface {
    name = 'ExternalLink1730997426335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`type\` tinyint NOT NULL COMMENT '文章类型：1-原创，2-外链' DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`link_url\` varchar(500) NULL COMMENT '外链地址'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`link_url\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`type\``);
    }
}