import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Game } from './entities/game.entity';
import { IgdbToken } from './entities/igdb-token.entity';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const COVER_SIZE = 't_cover_big';
const ARTWORK_SIZE = 't_1080p';
const IGDB_GAME_FIELDS =
  'id,name,slug,cover.url,artworks.url,first_release_date,summary,genres.name,platforms.name,' +
  'involved_companies.company.name,involved_companies.developer,involved_companies.publisher';

const STALE_AFTER_DAYS = 30;

interface IgdbCompany {
  company?: { name?: string };
  developer?: boolean;
  publisher?: boolean;
}
interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  cover?: { url?: string };
  artworks?: { url?: string }[];
  first_release_date?: number;
  summary?: string;
  genres?: { name: string }[];
  platforms?: { name: string }[];
  involved_companies?: IgdbCompany[];
}

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectRepository(Game) private readonly gamesRepo: Repository<Game>,
    @InjectRepository(IgdbToken) private readonly tokenRepo: Repository<IgdbToken>,
    private readonly configService: ConfigService,
  ) {}

  /** Busca por texto — sempre bate na IGDB (texto livre não cacheia como 1 registro). */
  async search(query: string): Promise<Game[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const token = await this.getTwitchToken();
    const escaped = trimmed.replace(/"/g, '\\"');
    const raw = await this.queryIgdb(token, `search "${escaped}"; fields ${IGDB_GAME_FIELDS}; limit 20;`);
    return this.upsertGames(raw.map((g) => this.mapIgdbGame(g)));
  }

  /** Detalhe por slug — só bate na IGDB se o cache não existir ou estiver velho. */
  async getBySlug(slug: string): Promise<Game> {
    const cached = await this.gamesRepo.findOne({ where: { slug } });
    const staleAt = new Date();
    staleAt.setDate(staleAt.getDate() - STALE_AFTER_DAYS);

    if (cached && cached.igdbUpdatedAt > staleAt) {
      return cached;
    }

    try {
      const token = await this.getTwitchToken();
      const raw = await this.queryIgdb(token, `where slug = "${slug}"; fields ${IGDB_GAME_FIELDS}; limit 1;`);
      if (raw.length === 0) {
        if (cached) return cached; // sumiu da IGDB mas ainda temos cache — melhor que nada
        throw new NotFoundException('Jogo não encontrado');
      }
      const [saved] = await this.upsertGames([this.mapIgdbGame(raw[0])]);
      return saved;
    } catch (err) {
      if (cached) {
        this.logger.warn(`IGDB falhou pro slug "${slug}", devolvendo cache velho`, err);
        return cached;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Game> {
    const game = await this.gamesRepo.findOne({ where: { id } });
    if (!game) throw new NotFoundException('Jogo não encontrado');
    return game;
  }

  // ─── IGDB / Twitch ──────────────────────────────────────────────────────

  private async getTwitchToken(): Promise<string> {
    const cached = await this.tokenRepo.findOne({ where: { id: 1 } });
    const oneHourMs = 60 * 60 * 1000;
    if (cached && cached.expiresAt.getTime() - Date.now() > oneHourMs) {
      return cached.accessToken;
    }

    const clientId = this.configService.getOrThrow<string>('TWITCH_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('TWITCH_CLIENT_SECRET');
    const url = `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new BadGatewayException(`Falha ao autenticar na Twitch (${res.status})`);
    const json = (await res.json()) as { access_token: string; expires_in: number };

    const expiresAt = new Date(Date.now() + json.expires_in * 1000);
    await this.tokenRepo.save({ id: 1, accessToken: json.access_token, expiresAt, updatedAt: new Date() });

    return json.access_token;
  }

  private async queryIgdb(token: string, query: string): Promise<IgdbGame[]> {
    const clientId = this.configService.getOrThrow<string>('TWITCH_CLIENT_ID');
    const res = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers: { 'Client-ID': clientId, Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
      body: query,
    });
    if (!res.ok) throw new BadGatewayException(`IGDB respondeu ${res.status}`);
    return (await res.json()) as IgdbGame[];
  }

  private resizeImage(url: string | undefined, size: string): string | null {
    if (!url) return null;
    const resized = url.replace('t_thumb', size);
    return resized.startsWith('//') ? `https:${resized}` : resized;
  }

  private mapIgdbGame(game: IgdbGame): Partial<Game> {
    const companies = game.involved_companies ?? [];
    const developers = companies.filter((c) => c.developer && c.company?.name).map((c) => c.company!.name!);
    const publishers = companies.filter((c) => c.publisher && c.company?.name).map((c) => c.company!.name!);
    const releaseDate = game.first_release_date ? new Date(game.first_release_date * 1000) : null;

    return {
      igdbId: game.id,
      slug: game.slug,
      title: game.name,
      coverUrl: this.resizeImage(game.cover?.url, COVER_SIZE),
      artworkUrl: this.resizeImage(game.artworks?.[0]?.url, ARTWORK_SIZE),
      releaseYear: releaseDate ? releaseDate.getUTCFullYear() : null,
      firstReleaseDate: releaseDate ? releaseDate.toISOString().slice(0, 10) : null,
      developers,
      publishers,
      platforms: (game.platforms ?? []).map((p) => p.name),
      genres: (game.genres ?? []).map((g) => g.name),
      summary: game.summary ?? null,
      igdbUpdatedAt: new Date(),
    };
  }

  /** Upsert por `slug` (não por `igdbId`) — mesmo raciocínio do Supabase original: `slug` é a
   * chave estável usada pra navegar, então é ela que decide se atualiza uma linha existente. */
  private async upsertGames(rows: Partial<Game>[]): Promise<Game[]> {
    const saved: Game[] = [];
    for (const row of rows) {
      const existing = await this.gamesRepo.findOne({ where: { slug: row.slug! } });
      if (existing) {
        await this.gamesRepo.update(existing.id, row);
        saved.push({ ...existing, ...row } as Game);
      } else {
        saved.push(await this.gamesRepo.save(this.gamesRepo.create(row)));
      }
    }
    return saved;
  }
}
