/**
 * Representa uma quadra de Beach Tennis.
 * Apenas quadras ativas são exibidas para usuários comuns nas listagens de partidas.
 */
export interface Quadra {
  id: string;
  nome: string;
  endereco: string;
  /** Quadra inativa não aparece nas partidas para usuário comum. */
  ativa: boolean;
}
