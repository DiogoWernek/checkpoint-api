import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Linha única (id fixo) — cache do access token de app da Twitch, dura ~60 dias. */
@Entity('igdb_token')
export class IgdbToken {
  @PrimaryColumn({ type: 'tinyint', default: 1 })
  id: number;

  @Column({ type: 'varchar', name: 'access_token' })
  accessToken: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
