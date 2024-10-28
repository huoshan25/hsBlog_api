import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameArticleBriefContent1730093964561 implements MigrationInterface {
    name = 'RenameArticleBriefContent1730093964561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`brief_content\` \`description\` varchar(255) NULL COMMENT '简要内容'`);
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`description\` varchar(100) NULL COMMENT '文章描述'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`description\` varchar(255) NULL COMMENT '简要内容'`);
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`description\` \`brief_content\` varchar(255) NULL COMMENT '简要内容'`);
    }

}
