import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonModal,
  IonButtons,
  IonMenuButton,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import type { Interessado } from '../../models/interessado.model';
import type { Sexo, Nivel, CategoriaPermitida } from '../../models/user.model';

@Component({
  selector: 'app-admin-interessados',
  templateUrl: './admin-interessados.page.html',
  styleUrls: ['./admin-interessados.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonModal,
    IonButtons,
    IonMenuButton,
  ],
})
export class AdminInteressadosPage implements OnInit {
  interessados: Interessado[] = [];
  modalAberto = false;
  formNome = '';
  formSexo: Sexo = 'masculino';
  formNivel: Nivel = 'B';
  formCategorias: CategoriaPermitida[] = ['mista'];
  formTelefone = '';

  sexos: Sexo[] = ['masculino', 'feminino'];
  niveis: Nivel[] = ['PRO', 'A', 'B', 'C', 'D', 'iniciante'];
  categorias: CategoriaPermitida[] = ['masculina', 'feminina', 'mista'];

  constructor(
    private data: DataService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.interessados = await this.data.getInteressados();
  }

  abrirModal(): void {
    this.formNome = '';
    this.formSexo = 'masculino';
    this.formNivel = 'B';
    this.formCategorias = ['mista'];
    this.formTelefone = '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  async salvar(): Promise<void> {
    if (!this.formNome.trim()) {
      const t = await this.toastCtrl.create({
        message: 'Informe o nome.',
        duration: 2000,
      });
      await t.present();
      return;
    }
    if (this.formCategorias.length === 0) {
      const t = await this.toastCtrl.create({
        message: 'Selecione ao menos uma categoria.',
        duration: 2000,
      });
      await t.present();
      return;
    }
    const id = 'int_' + Date.now();
    await this.data.addInteressado({
      id,
      nome: this.formNome.trim(),
      sexo: this.formSexo,
      nivel: this.formNivel,
      categoriasPermitidas: this.formCategorias,
      telefone: this.formTelefone.trim() || undefined,
    });
    const t = await this.toastCtrl.create({
      message: 'Interessado cadastrado (não possui localização no app).',
      duration: 3000,
    });
    await t.present();
    this.fecharModal();
    await this.carregar();
  }
}
