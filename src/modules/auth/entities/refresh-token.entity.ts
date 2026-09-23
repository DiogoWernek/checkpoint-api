import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['userId'])
@Index(['tokenHash'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'revoked_at' })
  revokedAt: Date | null;

  @Column({ type: 'varchar', nullable: true, name: 'ip_address', length: 45 })
  ipAddress: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'user_agent', length: 500 })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  get isValid(): boolean {
    return !this.revokedAt && this.expiresAt > new Date();
  }
}
