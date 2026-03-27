import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import type { Partida } from '../../models/partida.model';
import type { Quadra } from '../../models/quadra.model';

interface PartidaComQuadra extends Partida {
  quadraNome: string;
}

@Component({
  selector: 'app-partidas',
  templateUrl: './partidas.page.html',
  styleUrls: ['./partidas.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonSegment,
    IonSegmentButton,
  ],
})
export class PartidasPage implements OnInit {
  partidas: PartidaComQuadra[] = [];
  segment: 'todas' | 'minhas' = 'todas';

  constructor(
    public auth: AuthService,
    private data: DataService,
    private notification: NotificationService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    const [partidas, quadras] = await Promise.all([
      this.data.getPartidas(),
      this.data.getQuadras(),
    ]);
    const ativasIds = new Set(quadras.filter((q) => q.ativa).map((q) => q.id));
    const quadraMap = new Map(quadras.map((q) => [q.id, q.nome]));
    const user = this.auth.currentUser();
    const isAdmin = user?.tipo === 'admin';

    let list: PartidaComQuadra[] = partidas
      .filter((p) => isAdmin || ativasIds.has(p.quadraId))
      .map((p) => ({
        ...p,
        quadraNome: quadraMap.get(p.quadraId) ?? 'Quadra',
      }));

    list = list.sort(
      (a, b) =>
        new Date(a.data + 'T' + a.horario).getTime() -
        new Date(b.data + 'T' + b.horario).getTime()
    );

    if (this.segment === 'minhas' && user) {
      list = list.filter((p) => p.jogadoresConfirmados.includes(user.id));
    }
    this.partidas = list;
  }

  segmentChanged(): void {
    this.carregar();
  }

  async confirmarPresenca(partida: PartidaComQuadra): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    if (partida.jogadoresConfirmados.includes(user.id)) {
      const t = await this.toastCtrl.create({
        message: 'Você já está confirmado nesta partida.',
        duration: 2000,
      });
      await t.present();
      return;
    }
    if (partida.jogadoresConfirmados.length >= partida.vagasTotais) {
      const t = await this.toastCtrl.create({
        message: 'Partida lotada.',
        duration: 2000,
      });
      await t.present();
      return;
    }
    partida.jogadoresConfirmados = [...partida.jogadoresConfirmados, user.id];
    await this.data.updatePartida(partida);
    await this.carregar();
    const t = await this.toastCtrl.create({
      message: 'Presença confirmada!',
      duration: 2000,
    });
    await t.present();
  }

  vagasRestantes(p: PartidaComQuadra): number {
    return Math.max(0, p.vagasTotais - p.jogadoresConfirmados.length);
  }

  jaConfirmado(p: PartidaComQuadra): boolean {
    const user = this.auth.currentUser();
    return user ? p.jogadoresConfirmados.includes(user.id) : false;
  }

  /** Admin: ativa modo emergência na partida e dispara notificação. */
  async ativarModoEmergencia(p: PartidaComQuadra): Promise<void> {
    if (!this.auth.isAdmin()) return;
    p.modoEmergencia = true;
    await this.data.updatePartida(p);
    await this.notification.notifyModoEmergencia(p, p.quadraNome);
    await this.carregar();
    const t = await this.toastCtrl.create({
      message: 'Modo emergência ativado e notificação enviada.',
      duration: 3000,
    });
    await t.present();
  }
}
