import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Partida } from '../models/partida.model';
import type { User } from '../models/user.model';
import type { Interessado } from '../models/interessado.model';
import { DataService } from './data.service';

export interface NotificationResult {
  success: boolean;
  message?: string;
}

/**
 * Serviço centralizado para notificações locais do Beach Chama.
 * Em nativo: LocalNotifications (Capacitor). No navegador: Notification API.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private lastId = 0;

  constructor(private data: DataService) {}

  /** Indica se está rodando em navegador (ex.: ionic serve). */
  private isWeb(): boolean {
    return Capacitor.getPlatform() === 'web';
  }

  /**
   * Solicita permissão para notificações.
   * Navegador: Notification.requestPermission(). Android/iOS: LocalNotifications.requestPermissions().
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isWeb()) {
        if (!('Notification' in window)) {
          console.warn('[NotificationService] Notification API não disponível no navegador.');
          return false;
        }
        if (Notification.permission === 'granted') {
          console.log('[NotificationService] Permissão de notificação já concedida (navegador).');
          return true;
        }
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        console.log('[NotificationService] requestPermission (navegador):', result);
        return granted;
      }
      const perm = await LocalNotifications.requestPermissions();
      const granted = perm.display === 'granted';
      console.log('[NotificationService] requestPermissions (nativo):', perm.display);
      return granted;
    } catch (err) {
      console.error('[NotificationService] requestPermissions error:', err);
      return false;
    }
  }

  /** Verifica se notificações estão habilitadas. */
  async areEnabled(): Promise<boolean> {
    if (this.isWeb()) {
      return 'Notification' in window && Notification.permission === 'granted';
    }
    try {
      const r = await LocalNotifications.areEnabled();
      return r.value;
    } catch {
      return false;
    }
  }

  /**
   * Alias para testNotification. Solicita permissão e envia notificação imediata.
   */
  async sendTestNotification(title?: string, body?: string): Promise<NotificationResult> {
    return this.testNotification(title, body);
  }

  /**
   * Agenda uma notificação para daqui a 1 minuto (demonstração Etapa 3).
   * Navegador: setTimeout + Notification API. Nativo: LocalNotifications.schedule().
   */
  async scheduleNotification(title?: string, body?: string): Promise<NotificationResult> {
    const t = title ?? 'Beach Chama - Agendada';
    const b = body ?? 'Notificação agendada para 1 minuto.';
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        return { success: false, message: 'Permissão de notificação negada.' };
      }
      const inOneMin = new Date(Date.now() + 60 * 1000);
      if (this.isWeb()) {
        setTimeout(() => {
          try {
            new Notification(t, { body: b });
          } catch (e) {
            console.warn('[NotificationService] scheduleNotification (web):', e);
          }
        }, 60 * 1000);
        return { success: true, message: 'Notificação agendada para 1 minuto (navegador).' };
      }
      const id = ++this.lastId + 50000;
      await LocalNotifications.schedule({
        notifications: [
          { id, title: t, body: b, schedule: { at: inOneMin, allowWhileIdle: true } },
        ],
      });
      return { success: true, message: 'Notificação agendada para 1 minuto.' };
    } catch (err) {
      console.error('[NotificationService] scheduleNotification error:', err);
      return { success: false, message: 'Falha ao agendar notificação.' };
    }
  }

  /**
   * Dispara uma notificação de teste (para demonstração acadêmica).
   * Navegador: Notification API. Android/iOS: LocalNotifications.schedule().
   * Retorna resultado com mensagem amigável.
   */
  async testNotification(title?: string, body?: string): Promise<NotificationResult> {
    const t = title ?? 'Beach Chama - Teste';
    const b = body ?? 'Notificação local de teste. Recursos nativos OK.';
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        const msg = this.isWeb()
          ? 'Permissão de notificação negada. Permita nas configurações do navegador.'
          : 'Permissão de notificação negada. Ative nas configurações do dispositivo.';
        console.warn('[NotificationService] testNotification: permissão negada.');
        return { success: false, message: msg };
      }
      if (this.isWeb()) {
        new Notification(t, { body: b });
        console.log('[NotificationService] Notificação exibida (navegador).');
        return { success: true, message: 'Notificação exibida no navegador.' };
      }
      const id = ++this.lastId;
      const at = new Date(Date.now() + 1000);
      await LocalNotifications.schedule({
        notifications: [
          { id, title: t, body: b, schedule: { at, allowWhileIdle: true } },
        ],
      });
      console.log('[NotificationService] Notificação agendada (nativo).');
      return { success: true, message: 'Notificação será exibida em instantes.' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao disparar notificação.';
      console.error('[NotificationService] testNotification error:', err);
      return { success: false, message: 'Falha ao enviar notificação. Tente novamente.' };
    }
  }

  /**
   * Envia notificação imediata (ex: partida criada).
   * No navegador não envia (fluxo de partida usa apenas nativo); para teste use testNotification().
   */
  async notifyNow(title: string, body: string): Promise<void> {
    if (this.isWeb()) return;
    try {
      const granted = await this.requestPermissions();
      if (!granted) return;
      const id = ++this.lastId;
      const at = new Date(Date.now() + 2000);
      await LocalNotifications.schedule({
        notifications: [
          { id, title, body, schedule: { at, allowWhileIdle: true } },
        ],
      });
    } catch (err) {
      console.error('[NotificationService] notifyNow error:', err);
    }
  }

  /**
   * Agenda notificação para uma data/hora específica (ex: 30 min antes da partida).
   */
  async scheduleAt(notificationId: number, title: string, body: string, at: Date): Promise<void> {
    if (this.isWeb()) return;
    const granted = await this.requestPermissions();
    if (!granted) return;
    if (at.getTime() <= Date.now()) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title,
          body,
          schedule: { at, allowWhileIdle: true },
        },
      ],
    });
  }

  /**
   * Retorna a Data/hora da partida em milissegundos (data + horario).
   */
  getPartidaDateTimeMs(partida: Partida): number {
    const [y, m, d] = partida.data.split('-').map(Number);
    const [h, min] = partida.horario.split(':').map(Number);
    const date = new Date(y, m - 1, d, h, min, 0, 0);
    return date.getTime();
  }

  /**
   * Notifica ao criar partida: envia para usuários compatíveis com a categoria e nível.
   * Regras: masculina -> só homens com categoria masculina; feminina -> só mulheres com categoria feminina;
   * mista -> não envia por sexo aqui (a composição é controlada em outro fluxo; aqui enviamos para quem tem "mista" permitido e nível).
   */
  async notifyPartidaCriada(partida: Partida, quadraNome: string): Promise<void> {
    const users = await this.data.getUsers();
    const quadra = await this.data.getQuadraById(partida.quadraId);
    if (!quadra?.ativa) return;
    const destinatarios = this.getDestinatariosPartida(partida, users, []);
    const title = 'Nova partida - Beach Chama';
    const body = `Partida ${partida.categoria} nível ${partida.nivel} em ${quadraNome}, ${partida.data} às ${partida.horario}.`;
    await this.notifyNow(title, body);
    // Em um app real, aqui enviaríamos a notificação apenas para os dispositivos dos destinatarios (push por user).
    // Como usamos notificação local, apenas o dispositivo atual recebe; a lógica de destinatários fica para backend futuro.
  }

  /**
   * Agenda lembrete 30 minutos antes da partida.
   */
  async scheduleLembrete30Min(partida: Partida, quadraNome: string): Promise<void> {
    const partidaMs = this.getPartidaDateTimeMs(partida);
    const thirtyMinBefore = new Date(partidaMs - 30 * 60 * 1000);
    if (thirtyMinBefore.getTime() <= Date.now()) return;
    const id = 10000 + parseInt(partida.id.replace(/\D/g, '').slice(-5), 10) || ++this.lastId;
    const title = 'Lembrete - Partida em 30 min';
    const body = `${quadraNome}: ${partida.data} às ${partida.horario}. Categoria ${partida.categoria}, nível ${partida.nivel}.`;
    await this.scheduleAt(id, title, body, thirtyMinBefore);
  }

  /**
   * Notificação ao ativar modo emergência: menos de 30 min para a partida,
   * permite notificar qualquer sexo compatível com o nível.
   */
  async notifyModoEmergencia(partida: Partida, quadraNome: string): Promise<void> {
    const title = 'Modo emergência - vaga na partida';
    const body = `Faltam menos de 30 min! ${quadraNome}, ${partida.data} ${partida.horario}. Categoria ${partida.categoria}, nível ${partida.nivel}.`;
    await this.notifyNow(title, body);
  }

  /**
   * Retorna lista de usuários (e interessados) que podem ser notificados para esta partida.
   * Partida masculina -> apenas usuários masculinos com categoriasPermitidas contendo 'masculina' e mesmo nível.
   * Partida feminina -> apenas femininas com 'feminina' e mesmo nível.
   * Partida mista -> usuários com 'mista' e mesmo nível (composição homem/mulher é controlada em outro fluxo).
   * Modo emergência + menos de 30 min: qualquer sexo compatível com nível.
   */
  getDestinatariosPartida(
    partida: Partida,
    users: User[],
    interessados: Interessado[]
  ): (User | Interessado)[] {
    const nivelOk = (n: string) => n === partida.nivel;
    const categoriaOk = (cats: string[]) => cats.includes(partida.categoria);
    const now = Date.now();
    const partidaMs = this.getPartidaDateTimeMs(partida);
    const menosDe30Min = partidaMs - now < 30 * 60 * 1000 && partida.modoEmergencia;

    const fromUsers = users.filter((u) => {
      if (!nivelOk(u.nivel)) return false;
      if (!categoriaOk(u.categoriasPermitidas)) return false;
      if (partida.categoria === 'masculina') return u.sexo === 'masculino';
      if (partida.categoria === 'feminina') return u.sexo === 'feminino';
      if (partida.categoria === 'mista') {
        if (menosDe30Min) return true;
        // Mista sem emergência: composição é controlada fora (quem falta homem/mulher); aqui consideramos todos com mista.
        return true;
      }
      return false;
    });

    const fromInteressados = interessados.filter((i) => {
      if (!nivelOk(i.nivel)) return false;
      if (!categoriaOk(i.categoriasPermitidas)) return false;
      if (partida.categoria === 'masculina') return i.sexo === 'masculino';
      if (partida.categoria === 'feminina') return i.sexo === 'feminino';
      return true;
    });

    return [...fromUsers, ...fromInteressados];
  }
}
