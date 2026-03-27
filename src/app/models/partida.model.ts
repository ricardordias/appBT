/**
 * Categoria da partida - determina quais usuários podem ser notificados
 * (masculina: só homens, feminina: só mulheres, mista: composição controlada).
 */
export type CategoriaPartida = 'masculina' | 'feminina' | 'mista';

/**
 * Nível da partida - deve ser compatível com o nível do usuário para notificação.
 */
export type NivelPartida = 'PRO' | 'A' | 'B' | 'C' | 'D' | 'iniciante';

export interface Partida {
  id: string;
  quadraId: string;
  /** Data no formato YYYY-MM-DD. */
  data: string;
  /** Horário no formato HH:mm. */
  horario: string;
  categoria: CategoriaPartida;
  nivel: NivelPartida;
  /** IDs dos usuários que confirmaram presença. */
  jogadoresConfirmados: string[];
  vagasTotais: number;
  /**
   * Modo emergência: quando ativo e faltando menos de 30 min para a partida,
   * permite notificar qualquer sexo compatível com o nível (relaxa regra de composição mista).
   */
  modoEmergencia: boolean;
}
