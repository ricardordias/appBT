import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonBadge,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    DecimalPipe,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
  IonCardContent,
  IonLabel,
  IonBadge,
  IonButtons,
  IonMenuButton,
],
})
export class HomePage implements OnInit {
  distanciaKm: number | null = null;
  localizacaoOk = false;

  constructor(
    public auth: AuthService,
    private data: DataService,
    private location: LocationService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    if (user.tipo === 'comum' && !user.possuiLocalizacao) {
      const coords = await this.location.getCurrentPosition();
      if (coords) {
        this.distanciaKm = await this.location.getDistanciaAteTopSportsClubKm(
          coords.latitude,
          coords.longitude
        );
        this.localizacaoOk = true;
        user.possuiLocalizacao = true;
        await this.data.updateUser(user);
      }
    } else if (user.possuiLocalizacao) {
      this.localizacaoOk = true;
      // Opcional: recalcular distância se tivéssemos lat/lon armazenados no user.
    }
  }

  get user() {
    return this.auth.currentUser();
  }
}
