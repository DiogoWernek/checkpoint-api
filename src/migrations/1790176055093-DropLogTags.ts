import { MigrationInterface, QueryRunner } from "typeorm";

/** Campo "tags" da tela Registrar removido — não vingou (feedback do usuário). */
export class DropLogTags1790176055093 implements MigrationInterface {
    name = 'DropLogTags1790176055093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cp_logs\` DROP COLUMN \`tags\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cp_logs\` ADD \`tags\` json NOT NULL`);
    }
}
