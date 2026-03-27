import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import type { Sexo, Nivel, CategoriaPermitida } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
})
export class RegisterPage {
  nome = '';
  email = '';
  senha = '';
  sexo: Sexo = 'masculino';
  nivel: Nivel = 'B';
  categoriasPermitidas: CategoriaPermitida[] = ['mista'];
  loading = false;

  sexos: Sexo[] = ['masculino', 'feminino'];
  niveis: Nivel[] = ['PRO', 'A', 'B', 'C', 'D', 'iniciante'];
  categorias: CategoriaPermitida[] = ['masculina', 'feminina', 'mista'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async register(): Promise<void> {
    if (!this.nome.trim() || !this.email.trim() || !this.senha) {
      await this.showToast('Preencha nome, e-mail e senha.');
      return;
    }
    if (this.categoriasPermitidas.length === 0) {
      await this.showToast('Selecione ao menos uma categoria.');
      return;
    }
    this.loading = true;
    const result = await this.auth.register(
      this.email.trim(),
      this.senha,
      this.nome.trim(),
      this.sexo,
      this.nivel,
      this.categoriasPermitidas
    );
    this.loading = false;
    if (result.ok) {
      this.router.navigate(['/home']);
    } else {
      await this.showToast(result.message ?? 'Erro ao cadastrar.');
    }
  }

  private async showToast(message: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 3000 });
    await t.present();
  }
}
