/** Espelha o `cp_game_status` do schema Postgres original (ver checkpoint/supabase/migrations). */
export enum GameStatus {
  PLAYING = 'playing',
  FINISHED = 'finished',
  COMPLETED_100 = 'completed_100',
  DROPPED = 'dropped',
  /** Só válido em GameState (ação rápida "Quero jogar") — nunca em Log. */
  WISHLIST = 'wishlist',
}

/** Status válidos pra um registro de diário (Log) — wishlist é só ação rápida. */
export const REGISTER_STATUSES = [
  GameStatus.PLAYING,
  GameStatus.FINISHED,
  GameStatus.COMPLETED_100,
  GameStatus.DROPPED,
] as const;
