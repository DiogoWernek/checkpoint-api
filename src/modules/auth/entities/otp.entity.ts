import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { OtpType } from '../../../common/enums/otp-type.enum';

@Entity('otps')
@Index(['target', 'type'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  target: string; // e-mail

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column({ type: 'varchar', name: 'code_hash' })
  codeHash: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'smallint', default: 0 })
  attempts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
