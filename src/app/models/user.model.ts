/**
 * Tipos de usuário do sistema APPBT.
 * comum: usuário que usa o app para ver e se inscrever em partidas.
 * admin: administrador com acesso à área administrativa (quadras, interessados, criar partidas).
 */
export type TipoUsuario = 'comum' | 'admin';

/**
 * Sexo do usuário - usado para regras de notificação (partida masculina/feminina/mista).
 */
export type Sexo = 'masculino' | 'feminino';

/**
 * Nível de jogo no Beach Tennis.
 * PRO, A, B, C, D ou iniciante - usado para filtrar partidas compatíveis.
 */
export type Nivel = 'PRO' | 'A' | 'B' | 'C' | 'D' | 'iniciante';

/**
 * Categorias em que o usuário pode participar.
 * masculina, feminina, mista - controla para quais partidas o usuário pode receber notificação.
 */
export type CategoriaPermitida = 'masculina' | 'feminina' | 'mista';

export interface User {
  id: string;
  /** Nome do usuário (ex: nome de exibição no app). */
  nome: string;
  sexo: Sexo;
  nivel: Nivel;
  /** Categorias que o usuário pode jogar (ex: ['masculina', 'mista']). */
  categoriasPermitidas: CategoriaPermitida[];
  tipo: TipoUsuario;
  /**
   * Indica se o usuário tem localização armazenada (geolocalização permitida e obtida).
   * Interessados cadastrados pelo admin não possuem localização.
   */
  possuiLocalizacao: boolean;
  /** Identificador usado no login (email ou nome único) - persistido pelo DataService. */
  loginEmail?: string;
}
