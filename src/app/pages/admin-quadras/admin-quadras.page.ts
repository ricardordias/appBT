import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import type { Quadra } from '../../models/quadra.model';

@Component({
  selector: 'app-admin-quadras',
  templateUrl: './admin-quadras.page.html',
  styleUrls: ['./admin-quadras.page.scss'],
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
    IonToggle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonInput,
  ],
})
export class AdminQuadrasPage implements OnInit {
  quadras: Quadra[] = [];
  modalAberto = false;
  editando: Quadra | null = null;
  formNome = '';
  formEndereco = '';

  constructor(
    private data: DataService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.quadras = await this.data.getQuadras();
  }

  async toggleAtiva(q: Quadra): Promise<void> {
    q.ativa = !q.ativa;
    await this.data.updateQuadra(q);
    await this.carregar();
    const t = await this.toastCtrl.create({
      message: q.ativa ? 'Quadra ativada.' : 'Quadra desativada.',
      duration: 2000,
    });
    await t.present();
  }

  abrirModal(quadra?: Quadra): void {
    this.editando = quadra ?? null;
    this.formNome = quadra?.nome ?? '';
    this.formEndereco = quadra?.endereco ?? '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.editando = null;
    this.formNome = '';
    this.formEndereco = '';
  }

  async salvar(): Promise<void> {
    if (!this.formNome.trim()) {
      const t = await this.toastCtrl.create({
        message: 'Informe o nome da quadra.',
        duration: 2000,
      });
      await t.present();
      return;
    }
    if (this.editando) {
      this.editando.nome = this.formNome.trim();
      this.editando.endereco = this.formEndereco.trim();
      await this.data.updateQuadra(this.editando);
      const t = await this.toastCtrl.create({
        message: 'Quadra atualizada.',
        duration: 2000,
      });
      await t.present();
    } else {
      const id = 'quadra_' + Date.now();
      await this.data.addQuadra({
        id,
        nome: this.formNome.trim(),
        endereco: this.formEndereco.trim(),
        ativa: true,
      });
      const t = await this.toastCtrl.create({
        message: 'Quadra cadastrada.',
        duration: 2000,
      });
      await t.present();
    }
    this.fecharModal();
    await this.carregar();
  }
}
