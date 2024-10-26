import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticleTagsCascade1729957690920 implements MigrationInterface {
    name = 'UpdateArticleTagsCascade1729957690920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 先删除旧的外键约束
        await queryRunner.query(`
            ALTER TABLE article_tags 
            DROP FOREIGN KEY FK_f8c9234a4c4cb37806387f0c9e9;
        `);

        // 添加新的级联删除外键约束
        await queryRunner.query(`
            ALTER TABLE article_tags 
            ADD CONSTRAINT FK_f8c9234a4c4cb37806387f0c9e9
            FOREIGN KEY (article_id) 
            REFERENCES article(id) 
            ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 回滚：删除带CASCADE的外键
        await queryRunner.query(`
            ALTER TABLE article_tags 
            DROP FOREIGN KEY FK_f8c9234a4c4cb37806387f0c9e9;
        `);

        // 添加回原来的外键约束（不带CASCADE）
        await queryRunner.query(`
            ALTER TABLE article_tags 
            ADD CONSTRAINT FK_f8c9234a4c4cb37806387f0c9e9
            FOREIGN KEY (article_id) 
            REFERENCES article(id);
        `);
    }

}
