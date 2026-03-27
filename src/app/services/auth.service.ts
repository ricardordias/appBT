import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserId = signal<string | null>(null);
  private loaded = signal(false);

  private currentUserData = signal<User | null>(null);

  /** Fonte de verdade: usuário logado (síncrono via computed). */
  currentUser = computed(() => this.currentUserData());

  /** Retorna o usuário logado ou null. Uso: auth.getCurrentUser() ou auth.currentUser(). */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /** True apenas se o usuário logado tiver tipo "admin". */
  isAdmin = computed(() => this.currentUserData()?.tipo === 'admin');

  isLoggedIn = computed(() => this.currentUserId() != null);

  constructor(
    private data: DataService,
    private router: Router
  ) {}

  async loadSession(): Promise<void> {
    if (this.loaded()) return;
    await this.data.init();
    const userId = await this.data.getAuthUserId();
    if (userId) {
      const user = await this.data.getUserById(userId);
      if (user) {
        this.currentUserData.set(user);
        this.currentUserId.set(user.id);
      } else {
        await this.data.clearAuth();
      }
    }
    this.loaded.set(true);
  }

  async login(email: string, senha: string): Promise<{ ok: boolean; message?: string }> {
    await this.data.init();
    const user = await this.data.getUserByEmail(email);
    if (!user) {
      return { ok: false, message: 'Usuário não encontrado.' };
    }
    // Login simples: senha = qualquer string (armazenamento local; em produção usar hash).
    // Aqui consideramos "senha" como armazenada no próprio User para simplicidade.
    const storedPassword = (user as User & { senha?: string }).senha ?? '';
    if (storedPassword !== senha) {
      return { ok: false, message: 'Senha incorreta.' };
    }
    this.currentUserData.set(user);
    this.currentUserId.set(user.id);
    await this.data.setAuth(email, user.id);
    return { ok: true };
  }

  async register(
    email: string,
    senha: string,
    nome: string,
    sexo: User['sexo'],
    nivel: User['nivel'],
    categoriasPermitidas: User['categoriasPermitidas']
  ): Promise<{ ok: boolean; message?: string }> {
    await this.data.init();
    const existing = await this.data.getUserByEmail(email);
    if (existing) {
      return { ok: false, message: 'Este e-mail já está cadastrado.' };
    }
    const users = await this.data.getUsers();
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const newUser: User = {
      id,
      nome,
      sexo,
      nivel,
      categoriasPermitidas,
      tipo: 'comum',
      possuiLocalizacao: false,
      loginEmail: email,
    };
    await this.data.addUser(newUser, email, senha);
    this.currentUserData.set(newUser);
    this.currentUserId.set(newUser.id);
    await this.data.setAuth(email, newUser.id);
    return { ok: true };
  }

  async logout(): Promise<void> {
    await this.data.clearAuth();
    this.currentUserData.set(null);
    this.currentUserId.set(null);
    this.router.navigate(['/login']);
  }

  async refreshUser(): Promise<void> {
    const id = this.currentUserId();
    if (!id) return;
    const user = await this.data.getUserById(id);
    if (user) {
      this.currentUserData.set(user);
    }
  }
}
