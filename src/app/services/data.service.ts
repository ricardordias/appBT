import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import type { User } from '../models/user.model';
import type { Quadra } from '../models/quadra.model';
import type { Partida } from '../models/partida.model';
import type { Interessado } from '../models/interessado.model';

const STORAGE_KEYS = {
  USERS: 'appbt_users',
  QUADRAS: 'appbt_quadras',
  PARTIDAS: 'appbt_partidas',
  INTERESSADOS: 'appbt_interessados',
  AUTH_EMAIL: 'appbt_auth_email',
  AUTH_USER_ID: 'appbt_auth_user_id',
} as const;

@Injectable({ providedIn: 'root' })
export class DataService {
  private storageReady = false;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (this.storageReady) return;
    await this.storage.create();
    this.storageReady = true;
    await this.seedIfEmpty();
  }

  /** Cria admin padrão e quadra TOP SPORTS CLUB se o storage estiver vazio. */
  private async seedIfEmpty(): Promise<void> {
    const users = await this.storage.get(STORAGE_KEYS.USERS);
    if (Array.isArray(users) && users.length > 0) return;
    const adminId = 'admin_1';
    const admin = {
      id: adminId,
      nome: 'Administrador',
      sexo: 'masculino' as const,
      nivel: 'A' as const,
      categoriasPermitidas: ['masculina', 'feminina', 'mista'] as const,
      tipo: 'admin' as const,
      possuiLocalizacao: false,
      loginEmail: 'admin@appbt.com',
      senha: 'admin123',
    };
    await this.storage.set(STORAGE_KEYS.USERS, [admin]);
    const quadra = {
      id: 'quadra_topsports',
      nome: 'TOP SPORTS CLUB',
      endereco: 'Porto Alegre, RS',
      ativa: true,
    };
    await this.storage.set(STORAGE_KEYS.QUADRAS, [quadra]);
  }

  private async ensureReady(): Promise<void> {
    if (!this.storageReady) await this.init();
  }

  // ---------- Auth (persistência de sessão) ----------
  async setAuth(email: string, userId: string): Promise<void> {
    await this.ensureReady();
    await this.storage.set(STORAGE_KEYS.AUTH_EMAIL, email);
    await this.storage.set(STORAGE_KEYS.AUTH_USER_ID, userId);
  }

  async getAuthUserId(): Promise<string | null> {
    await this.ensureReady();
    return this.storage.get(STORAGE_KEYS.AUTH_USER_ID);
  }

  async getAuthEmail(): Promise<string | null> {
    await this.ensureReady();
    return this.storage.get(STORAGE_KEYS.AUTH_EMAIL);
  }

  async clearAuth(): Promise<void> {
    await this.ensureReady();
    await this.storage.remove(STORAGE_KEYS.AUTH_EMAIL);
    await this.storage.remove(STORAGE_KEYS.AUTH_USER_ID);
  }

  // ---------- Usuários ----------
  async getUsers(): Promise<(User & { loginEmail?: string; senha?: string })[]> {
    await this.ensureReady();
    const list = await this.storage.get(STORAGE_KEYS.USERS);
    return Array.isArray(list) ? list : [];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  }

  async getUserByEmail(email: string): Promise<(User & { loginEmail?: string; senha?: string }) | undefined> {
    const users = await this.getUsers();
    return users.find((u) => (u as User & { loginEmail?: string }).loginEmail === email) as (User & { loginEmail?: string; senha?: string }) | undefined;
  }

  /** Adiciona usuário. loginEmail e senha são persistidos para login. */
  async addUser(user: User, loginEmail: string, senha?: string): Promise<void> {
    const users = await this.getUsers();
    const stored = { ...user, loginEmail, senha } as User & { loginEmail: string; senha?: string };
    users.push(stored);
    await this.storage.set(STORAGE_KEYS.USERS, users);
  }

  async updateUser(user: User & { loginEmail?: string; senha?: string }): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return;
    const existing = users[idx];
    users[idx] = {
      ...user,
      loginEmail: existing.loginEmail,
      senha: (user as { senha?: string }).senha ?? existing.senha,
    };
    await this.storage.set(STORAGE_KEYS.USERS, users);
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers().then((list) => list.filter((u) => u.id !== id));
    await this.storage.set(STORAGE_KEYS.USERS, users);
  }

  // ---------- Quadras ----------
  async getQuadras(): Promise<Quadra[]> {
    await this.ensureReady();
    const list = await this.storage.get(STORAGE_KEYS.QUADRAS);
    return Array.isArray(list) ? list : [];
  }

  async getQuadraById(id: string): Promise<Quadra | undefined> {
    const quadras = await this.getQuadras();
    return quadras.find((q) => q.id === id);
  }

  async addQuadra(quadra: Quadra): Promise<void> {
    const quadras = await this.getQuadras();
    quadras.push(quadra);
    await this.storage.set(STORAGE_KEYS.QUADRAS, quadras);
  }

  async updateQuadra(quadra: Quadra): Promise<void> {
    const quadras = await this.getQuadras();
    const idx = quadras.findIndex((q) => q.id === quadra.id);
    if (idx === -1) return;
    quadras[idx] = quadra;
    await this.storage.set(STORAGE_KEYS.QUADRAS, quadras);
  }

  async deleteQuadra(id: string): Promise<void> {
    const quadras = await this.getQuadras().then((list) => list.filter((q) => q.id !== id));
    await this.storage.set(STORAGE_KEYS.QUADRAS, quadras);
  }

  // ---------- Partidas ----------
  async getPartidas(): Promise<Partida[]> {
    await this.ensureReady();
    const list = await this.storage.get(STORAGE_KEYS.PARTIDAS);
    return Array.isArray(list) ? list : [];
  }

  async getPartidaById(id: string): Promise<Partida | undefined> {
    const partidas = await this.getPartidas();
    return partidas.find((p) => p.id === id);
  }

  async addPartida(partida: Partida): Promise<void> {
    const partidas = await this.getPartidas();
    partidas.push(partida);
    await this.storage.set(STORAGE_KEYS.PARTIDAS, partidas);
  }

  async updatePartida(partida: Partida): Promise<void> {
    const partidas = await this.getPartidas();
    const idx = partidas.findIndex((p) => p.id === partida.id);
    if (idx === -1) return;
    partidas[idx] = partida;
    await this.storage.set(STORAGE_KEYS.PARTIDAS, partidas);
  }

  async deletePartida(id: string): Promise<void> {
    const partidas = await this.getPartidas().then((list) => list.filter((p) => p.id !== id));
    await this.storage.set(STORAGE_KEYS.PARTIDAS, partidas);
  }

  // ---------- Interessados ----------
  async getInteressados(): Promise<Interessado[]> {
    await this.ensureReady();
    const list = await this.storage.get(STORAGE_KEYS.INTERESSADOS);
    return Array.isArray(list) ? list : [];
  }

  async getInteressadoById(id: string): Promise<Interessado | undefined> {
    const list = await this.getInteressados();
    return list.find((i) => i.id === id);
  }

  async addInteressado(interessado: Interessado): Promise<void> {
    const list = await this.getInteressados();
    list.push(interessado);
    await this.storage.set(STORAGE_KEYS.INTERESSADOS, list);
  }

  async updateInteressado(interessado: Interessado): Promise<void> {
    const list = await this.getInteressados();
    const idx = list.findIndex((i) => i.id === interessado.id);
    if (idx === -1) return;
    list[idx] = interessado;
    await this.storage.set(STORAGE_KEYS.INTERESSADOS, list);
  }

  async deleteInteressado(id: string): Promise<void> {
    const list = await this.getInteressados().then((l) => l.filter((i) => i.id !== id));
    await this.storage.set(STORAGE_KEYS.INTERESSADOS, list);
  }
}
