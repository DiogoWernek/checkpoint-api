import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * Junta auth + perfil público numa entidade só (diferente do Supabase, que
 * separava `auth.users`/`cp_profiles` por causa do RLS) — aqui não há RLS,
 * então não faz sentido duas tabelas pra always-join-together.
 */
@Entity('cp_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // Mesma regra de `cp_profiles_username_format` do schema antigo (ver packages/core/src/schemas/auth.ts).
  @Column({ type: 'varchar', length: 20, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 60, name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, name: 'password_hash' })
  passwordHash: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ type: 'smallint', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Exclude()
  @Column({ type: 'datetime', nullable: true, name: 'locked_until' })
  lockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
