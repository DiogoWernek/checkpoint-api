import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1790174515910 implements MigrationInterface {
    name = 'Initial1790174515910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cp_users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`username\` varchar(20) NOT NULL, \`display_name\` varchar(60) NOT NULL, \`bio\` varchar(500) NULL, \`avatar_url\` varchar(255) NULL, \`password_hash\` varchar(255) NULL, \`is_email_verified\` tinyint NOT NULL DEFAULT 0, \`failed_login_attempts\` smallint NOT NULL DEFAULT '0', \`locked_until\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d22529a05b3185f0fd144f9472\` (\`email\`), UNIQUE INDEX \`IDX_5d77d794a0b1dea6ac76a61304\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_lists\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_8e26f4b6f65e6bb4dd479c2904\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_games\` (\`id\` varchar(36) NOT NULL, \`igdb_id\` bigint NOT NULL, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`cover_url\` varchar(255) NULL, \`artwork_url\` varchar(255) NULL, \`release_year\` int NULL, \`first_release_date\` date NULL, \`developers\` json NOT NULL, \`publishers\` json NOT NULL, \`platforms\` json NOT NULL, \`genres\` json NOT NULL, \`summary\` text NULL, \`igdb_updated_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_76d1d2f87bd134c1a55f9240b8\` (\`igdb_id\`), UNIQUE INDEX \`IDX_8825054edb940877f0c72bfd4d\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_list_items\` (\`id\` varchar(36) NOT NULL, \`list_id\` varchar(255) NOT NULL, \`game_id\` varchar(255) NOT NULL, \`position\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8f9edfdc97ebf1b4d7b1d1692b\` (\`list_id\`, \`game_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_follows\` (\`follower_id\` varchar(255) NOT NULL, \`following_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_fec5416552664c39795cc53ef2\` (\`following_id\`), PRIMARY KEY (\`follower_id\`, \`following_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_favorites\` (\`user_id\` varchar(255) NOT NULL, \`game_id\` varchar(255) NOT NULL, \`position\` smallint NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_278822c832bfc608bfaf5dd310\` (\`user_id\`, \`position\`), PRIMARY KEY (\`user_id\`, \`game_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_logs\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`game_id\` varchar(255) NOT NULL, \`status\` enum ('playing', 'finished', 'completed_100', 'dropped', 'wishlist') NOT NULL, \`rating\` smallint NULL, \`liked\` tinyint NOT NULL DEFAULT 0, \`played_on\` date NULL, \`hours\` decimal(6,1) NULL, \`platform\` varchar(255) NULL, \`is_replay\` tinyint NOT NULL DEFAULT 0, \`tags\` json NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_70dc2098aaf3efa991ab272ca5\` (\`game_id\`), INDEX \`IDX_8467228d9e2ac488b40e3a76cb\` (\`user_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_review_likes\` (\`review_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`review_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_review_comments\` (\`id\` varchar(36) NOT NULL, \`review_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`body\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_2f5006906091bf57afdceedba7\` (\`review_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_reviews\` (\`id\` varchar(36) NOT NULL, \`log_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`game_id\` varchar(255) NOT NULL, \`body\` text NOT NULL, \`has_spoilers\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_dd1174a24e0eab36964524faac\` (\`user_id\`), INDEX \`IDX_1e61fa818325ee29a02daaa8ea\` (\`game_id\`, \`created_at\`), UNIQUE INDEX \`IDX_1e86da2f95b6c51ed3f9d94050\` (\`log_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_igdb_token\` (\`id\` tinyint NOT NULL DEFAULT '1', \`access_token\` varchar(255) NOT NULL, \`expires_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_game_states\` (\`user_id\` varchar(255) NOT NULL, \`game_id\` varchar(255) NOT NULL, \`status\` enum ('playing', 'finished', 'completed_100', 'dropped', 'wishlist') NOT NULL, \`rating\` smallint NULL, \`liked\` tinyint NOT NULL DEFAULT 0, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`, \`game_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` datetime NULL, \`ip_address\` varchar(45) NULL, \`user_agent\` varchar(500) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_d0a9d562aa4f857292521f10d5\` (\`token_hash\`), INDEX \`IDX_b6c982f1912fa159f79c04fa83\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cp_otps\` (\`id\` varchar(36) NOT NULL, \`target\` varchar(255) NOT NULL, \`type\` enum ('email_verification', 'password_reset', 'login') NOT NULL, \`code_hash\` varchar(255) NOT NULL, \`expires_at\` datetime NOT NULL, \`used\` tinyint NOT NULL DEFAULT 0, \`attempts\` smallint NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_414d8f22cfafe7eab8301f48b1\` (\`target\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cp_lists\` ADD CONSTRAINT \`FK_8e26f4b6f65e6bb4dd479c29048\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_list_items\` ADD CONSTRAINT \`FK_145dab41a7985782619da296bd8\` FOREIGN KEY (\`list_id\`) REFERENCES \`cp_lists\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_list_items\` ADD CONSTRAINT \`FK_b6033a1748dd1a579d95802b160\` FOREIGN KEY (\`game_id\`) REFERENCES \`cp_games\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_follows\` ADD CONSTRAINT \`FK_9ac8e2d343303a663ed30d43f2b\` FOREIGN KEY (\`follower_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_follows\` ADD CONSTRAINT \`FK_fec5416552664c39795cc53ef2b\` FOREIGN KEY (\`following_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_favorites\` ADD CONSTRAINT \`FK_7251c328bdf67ec119f4c3c61f7\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_favorites\` ADD CONSTRAINT \`FK_76ee07a04ebfea4bf6fc1a195ef\` FOREIGN KEY (\`game_id\`) REFERENCES \`cp_games\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_logs\` ADD CONSTRAINT \`FK_bcf5fb4ca492385eeb1e8fb7196\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_logs\` ADD CONSTRAINT \`FK_70dc2098aaf3efa991ab272ca53\` FOREIGN KEY (\`game_id\`) REFERENCES \`cp_games\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_review_likes\` ADD CONSTRAINT \`FK_531fcb7bca67bcaad024be04ea3\` FOREIGN KEY (\`review_id\`) REFERENCES \`cp_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_review_likes\` ADD CONSTRAINT \`FK_4731694af22bfb6582c6573e09b\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_review_comments\` ADD CONSTRAINT \`FK_a68eb403975b44f92288419b96e\` FOREIGN KEY (\`review_id\`) REFERENCES \`cp_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_review_comments\` ADD CONSTRAINT \`FK_2b5ec15722e76221be203a6ca67\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` ADD CONSTRAINT \`FK_1e86da2f95b6c51ed3f9d940507\` FOREIGN KEY (\`log_id\`) REFERENCES \`cp_logs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` ADD CONSTRAINT \`FK_dd1174a24e0eab36964524faac4\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` ADD CONSTRAINT \`FK_998756072e2b3edb5e6a20a116e\` FOREIGN KEY (\`game_id\`) REFERENCES \`cp_games\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_game_states\` ADD CONSTRAINT \`FK_45d6c49a583d7c95b77d3fd83f9\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_game_states\` ADD CONSTRAINT \`FK_d2a5f6b76abe9b7dfa1ec7fb8b2\` FOREIGN KEY (\`game_id\`) REFERENCES \`cp_games\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cp_refresh_tokens\` ADD CONSTRAINT \`FK_b6c982f1912fa159f79c04fa839\` FOREIGN KEY (\`user_id\`) REFERENCES \`cp_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cp_refresh_tokens\` DROP FOREIGN KEY \`FK_b6c982f1912fa159f79c04fa839\``);
        await queryRunner.query(`ALTER TABLE \`cp_game_states\` DROP FOREIGN KEY \`FK_d2a5f6b76abe9b7dfa1ec7fb8b2\``);
        await queryRunner.query(`ALTER TABLE \`cp_game_states\` DROP FOREIGN KEY \`FK_45d6c49a583d7c95b77d3fd83f9\``);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` DROP FOREIGN KEY \`FK_998756072e2b3edb5e6a20a116e\``);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` DROP FOREIGN KEY \`FK_dd1174a24e0eab36964524faac4\``);
        await queryRunner.query(`ALTER TABLE \`cp_reviews\` DROP FOREIGN KEY \`FK_1e86da2f95b6c51ed3f9d940507\``);
        await queryRunner.query(`ALTER TABLE \`cp_review_comments\` DROP FOREIGN KEY \`FK_2b5ec15722e76221be203a6ca67\``);
        await queryRunner.query(`ALTER TABLE \`cp_review_comments\` DROP FOREIGN KEY \`FK_a68eb403975b44f92288419b96e\``);
        await queryRunner.query(`ALTER TABLE \`cp_review_likes\` DROP FOREIGN KEY \`FK_4731694af22bfb6582c6573e09b\``);
        await queryRunner.query(`ALTER TABLE \`cp_review_likes\` DROP FOREIGN KEY \`FK_531fcb7bca67bcaad024be04ea3\``);
        await queryRunner.query(`ALTER TABLE \`cp_logs\` DROP FOREIGN KEY \`FK_70dc2098aaf3efa991ab272ca53\``);
        await queryRunner.query(`ALTER TABLE \`cp_logs\` DROP FOREIGN KEY \`FK_bcf5fb4ca492385eeb1e8fb7196\``);
        await queryRunner.query(`ALTER TABLE \`cp_favorites\` DROP FOREIGN KEY \`FK_76ee07a04ebfea4bf6fc1a195ef\``);
        await queryRunner.query(`ALTER TABLE \`cp_favorites\` DROP FOREIGN KEY \`FK_7251c328bdf67ec119f4c3c61f7\``);
        await queryRunner.query(`ALTER TABLE \`cp_follows\` DROP FOREIGN KEY \`FK_fec5416552664c39795cc53ef2b\``);
        await queryRunner.query(`ALTER TABLE \`cp_follows\` DROP FOREIGN KEY \`FK_9ac8e2d343303a663ed30d43f2b\``);
        await queryRunner.query(`ALTER TABLE \`cp_list_items\` DROP FOREIGN KEY \`FK_b6033a1748dd1a579d95802b160\``);
        await queryRunner.query(`ALTER TABLE \`cp_list_items\` DROP FOREIGN KEY \`FK_145dab41a7985782619da296bd8\``);
        await queryRunner.query(`ALTER TABLE \`cp_lists\` DROP FOREIGN KEY \`FK_8e26f4b6f65e6bb4dd479c29048\``);
        await queryRunner.query(`DROP INDEX \`IDX_414d8f22cfafe7eab8301f48b1\` ON \`cp_otps\``);
        await queryRunner.query(`DROP TABLE \`cp_otps\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6c982f1912fa159f79c04fa83\` ON \`cp_refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_d0a9d562aa4f857292521f10d5\` ON \`cp_refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`cp_refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`cp_game_states\``);
        await queryRunner.query(`DROP TABLE \`cp_igdb_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e86da2f95b6c51ed3f9d94050\` ON \`cp_reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e61fa818325ee29a02daaa8ea\` ON \`cp_reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd1174a24e0eab36964524faac\` ON \`cp_reviews\``);
        await queryRunner.query(`DROP TABLE \`cp_reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_2f5006906091bf57afdceedba7\` ON \`cp_review_comments\``);
        await queryRunner.query(`DROP TABLE \`cp_review_comments\``);
        await queryRunner.query(`DROP TABLE \`cp_review_likes\``);
        await queryRunner.query(`DROP INDEX \`IDX_8467228d9e2ac488b40e3a76cb\` ON \`cp_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_70dc2098aaf3efa991ab272ca5\` ON \`cp_logs\``);
        await queryRunner.query(`DROP TABLE \`cp_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_278822c832bfc608bfaf5dd310\` ON \`cp_favorites\``);
        await queryRunner.query(`DROP TABLE \`cp_favorites\``);
        await queryRunner.query(`DROP INDEX \`IDX_fec5416552664c39795cc53ef2\` ON \`cp_follows\``);
        await queryRunner.query(`DROP TABLE \`cp_follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f9edfdc97ebf1b4d7b1d1692b\` ON \`cp_list_items\``);
        await queryRunner.query(`DROP TABLE \`cp_list_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_8825054edb940877f0c72bfd4d\` ON \`cp_games\``);
        await queryRunner.query(`DROP INDEX \`IDX_76d1d2f87bd134c1a55f9240b8\` ON \`cp_games\``);
        await queryRunner.query(`DROP TABLE \`cp_games\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e26f4b6f65e6bb4dd479c2904\` ON \`cp_lists\``);
        await queryRunner.query(`DROP TABLE \`cp_lists\``);
        await queryRunner.query(`DROP INDEX \`IDX_5d77d794a0b1dea6ac76a61304\` ON \`cp_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_d22529a05b3185f0fd144f9472\` ON \`cp_users\``);
        await queryRunner.query(`DROP TABLE \`cp_users\``);
    }

}
