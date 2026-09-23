import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true, name: 'igdb_id' })
  igdbId: number;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true, name: 'cover_url' })
  coverUrl: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'artwork_url' })
  artworkUrl: string | null;

  @Column({ type: 'int', nullable: true, name: 'release_year' })
  releaseYear: number | null;

  @Column({ type: 'date', nullable: true, name: 'first_release_date' })
  firstReleaseDate: string | null;

  // MySQL não tem array nativo (diferente do Postgres) — json faz o mesmo papel aqui.
  @Column({ type: 'json' })
  developers: string[];

  @Column({ type: 'json' })
  publishers: string[];

  @Column({ type: 'json' })
  platforms: string[];

  @Column({ type: 'json' })
  genres: string[];

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'datetime', name: 'igdb_updated_at' })
  igdbUpdatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
