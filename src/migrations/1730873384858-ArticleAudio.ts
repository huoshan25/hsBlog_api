import { MigrationInterface, QueryRunner } from "typeorm";

export class ArticleAudio1730873384858 implements MigrationInterface {
    name = 'ArticleAudio1730873384858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`short_content\` varchar(330) NOT NULL COMMENT '文章概要文本' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`short_audio_url\` varchar(255) NOT NULL COMMENT '文章概要音频' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`long_content\` varchar(255) NOT NULL COMMENT '文章对话文本' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`long_audio_url\` varchar(255) NOT NULL COMMENT '文章对话音频' DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`long_audio_url\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`long_content\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`short_audio_url\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`short_content\``);
    }

}
