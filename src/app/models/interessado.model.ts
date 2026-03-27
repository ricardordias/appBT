import type { Sexo, Nivel, CategoriaPermitida } from './user.model';

/**
 * Interessado: pessoa cadastrada pelo admin que ainda não usa o app.
 * Não possui conta (login) nem localização - usado para envio de notificações por outros meios (ex: futuro SMS).
 * Campos alinhados ao User para compatibilidade de nível/categoria nas regras de notificação.
 */
export interface Interessado {
  id: string;
  nome: string;
  sexo: Sexo;
  nivel: Nivel;
  categoriasPermitidas: CategoriaPermitida[];
  /** Opcional - para contato pelo admin. */
  telefone?: string;
}
