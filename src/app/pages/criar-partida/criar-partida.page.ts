import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import type { Quadra } from '../../models/quadra.model';
import type { Partida } from '../../models/partida.model';
import type { CategoriaPartida, NivelPartida } from '../../models/partida.model';

@Component({
  selector: 'app-criar-partida',
  templateUrl: './criar-partida.page.html',
  styleUrls: ['./criar-partida.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
  ],
})
export class CriarPartidaPage implements OnInit {
  quadras: Quadra[] = [];
  quadraId = '';
  data = '';
  horario = '';
  categoria: CategoriaPartida = 'mista';
  nivel: NivelPartida = 'B';
  vagasTotais = 4;
  modoEmergencia = false;
  loading = false;

  categorias: CategoriaPartida[] = ['masculina', 'feminina', 'mista'];
  niveis: NivelPartida[] = ['PRO', 'A', 'B', 'C', 'D', 'iniciante'];

  constructor(
    private dataService: DataService,
    private notification: NotificationService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    this.quadras = (await this.dataService.getQuadras()).filter((q) => q.ativa);
    if (this.quadras.length > 0 && !this.quadraId) {
      this.quadraId = this.quadras[0].id;
    }
  }

  async salvar(): Promise<void> {
    if (!this.quadraId || !this.data || !this.horario) {
      const t = await this.toastCtrl.create({
        message: 'Preencha quadra, data e horário.',
        duration: 3000,
      });
      await t.present();
      return;
    }
    this.loading = true;
    const id = 'partida_' + Date.now();
    const partida: Partida = {
      id,
      quadraId: this.quadraId,
      data: this.data,
      horario: this.horario,
      categoria: this.categoria,
      nivel: this.nivel,
      jogadoresConfirmados: [],
      vagasTotais: this.vagasTotais,
      modoEmergencia: this.modoEmergencia,
    };
    await this.dataService.addPartida(partida);
    const quadra = this.quadras.find((q) => q.id === this.quadraId);
    const quadraNome = quadra?.nome ?? 'Quadra';
    await this.notification.notifyPartidaCriada(partida, quadraNome);
    await this.notification.scheduleLembrete30Min(partida, quadraNome);
    this.loading = false;
    const t = await this.toastCtrl.create({
      message: 'Partida criada e notificação enviada.',
      duration: 3000,
    });
    await t.present();
    this.router.navigate(['/partidas']);
  }
}
