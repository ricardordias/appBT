import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { GeolocationService } from '../../services/geolocation.service';
import { NotificationService } from '../../services/notification.service';
import type { Partida } from '../../models/partida.model';

@Component({
  selector: 'app-demo-etapa3',
  templateUrl: './demo-etapa3.page.html',
  styleUrls: ['./demo-etapa3.page.scss'],
  imports: [
    RouterLink,
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
    IonButton,
  ],
})
export class DemoEtapa3Page implements OnInit {
  userName = '';
  userTipo = '';
  quadrasCount = 0;
  partidasCount = 0;
  partidasList: Partida[] = [];
  gpsLat: number | null = null;
  gpsLon: number | null = null;
  gpsMessage = '';
  gpsLoading = false;
  notifPermMessage = '';
  notifLoading = false;

  constructor(
    public auth: AuthService,
    private data: DataService,
    private geolocation: GeolocationService,
    private notification: NotificationService,
    private toast: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.userName = user.nome;
      this.userTipo = user.tipo;
    }
    await this.refreshData();
  }

  async refreshData(): Promise<void> {
    const [quadras, partidas] = await Promise.all([
      this.data.getQuadras(),
      this.data.getPartidas(),
    ]);
    this.quadrasCount = quadras.length;
    this.partidasCount = partidas.length;
    this.partidasList = partidas;
  }

  async criarPartidaTeste(): Promise<void> {
    try {
      const quadras = await this.data.getQuadras();
      const quadraId = quadras[0]?.id ?? 'quadra_topsports';
      const partida: Partida = {
        id: 'demo_' + Date.now(),
        quadraId,
        data: new Date().toISOString().slice(0, 10),
        horario: '12:00',
        categoria: 'mista',
        nivel: 'B',
        jogadoresConfirmados: [],
        vagasTotais: 4,
        modoEmergencia: false,
      };
      await this.data.addPartida(partida);
      await this.refreshData();
      await this.showToast('Partida de teste criada.');
    } catch (e) {
      console.error(e);
      await this.showToast('Erro ao criar partida de teste.', true);
    }
  }

  async listarPartidas(): Promise<void> {
    await this.refreshData();
    await this.showToast('Total: ' + this.partidasCount + ' partida(s).');
  }

  async gpsSolicitarPermissao(): Promise<void> {
    const r = await this.geolocation.requestPermissions();
    this.gpsMessage = r.granted ? 'Permissão concedida.' : (r.message ?? 'Permissão negada.');
  }

  async gpsObterLocalizacao(): Promise<void> {
    this.gpsLoading = true;
    this.gpsMessage = '';
    this.gpsLat = null;
    this.gpsLon = null;
    try {
      const r = await this.geolocation.getCurrentPosition();
      if (r.success && r.latitude != null && r.longitude != null) {
        this.gpsLat = r.latitude;
        this.gpsLon = r.longitude;
        this.gpsMessage = 'Lat: ' + r.latitude.toFixed(6) + ' | Lon: ' + r.longitude.toFixed(6);
      } else {
        this.gpsMessage = r.message ?? 'Não foi possível obter a localização.';
      }
    } catch (e) {
      this.gpsMessage = 'Erro ao obter localização.';
    } finally {
      this.gpsLoading = false;
    }
  }

  async notifSolicitarPermissao(): Promise<void> {
    const granted = await this.notification.requestPermissions();
    this.notifPermMessage = granted ? 'Permissão concedida.' : 'Permissão negada.';
  }

  async notifEnviarImediata(): Promise<void> {
    this.notifLoading = true;
    try {
      const r = await this.notification.sendTestNotification('Beach Chama', 'Notificação imediata.');
      this.notifPermMessage = r.message ?? (r.success ? 'Enviada.' : 'Falha.');
      await this.showToast(r.success ? 'Notificação enviada.' : (r.message ?? 'Falha.'), !r.success);
    } finally {
      this.notifLoading = false;
    }
  }

  async notifAgendar1Min(): Promise<void> {
    this.notifLoading = true;
    try {
      const r = await this.notification.scheduleNotification(
        'Beach Chama',
        'Notificação agendada para 1 minuto.'
      );
      this.notifPermMessage = r.message ?? (r.success ? 'Agendada.' : 'Falha.');
      await this.showToast(r.success ? 'Notificação agendada para 1 minuto.' : (r.message ?? 'Falha.'), !r.success);
    } finally {
      this.notifLoading = false;
    }
  }

  private async showToast(message: string, isError = false): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3000,
      color: isError ? 'warning' : 'success',
    });
    await t.present();
  }
}
