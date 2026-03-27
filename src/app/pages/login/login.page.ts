import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
  ],
})
export class LoginPage {
  email = '';
  senha = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async login(): Promise<void> {
    if (!this.email.trim() || !this.senha) {
      await this.showToast('Preencha e-mail e senha.');
      return;
    }
    this.loading = true;
    const result = await this.auth.login(this.email.trim(), this.senha);
    this.loading = false;
    if (result.ok) {
      const u = this.auth.currentUser();
      if (u?.tipo === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      await this.showToast(result.message ?? 'Erro ao entrar.');
    }
  }

  private async showToast(message: string): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 3000 });
    await t.present();
  }
}
