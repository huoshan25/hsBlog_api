import { MigrationInterface, QueryRunner } from "typeorm";

export class NewViewCount1739173798164 implements MigrationInterface {
    name = 'NewViewCount1739173798164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`view_count\` int UNSIGNED NOT NULL COMMENT '文章浏览数' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`view_count\``);
    }

}
