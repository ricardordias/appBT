import { Injectable } from '@angular/core';
import { GeolocationService } from './geolocation.service';

/** Coordenadas da TOP SPORTS CLUB, Porto Alegre (referência para cálculo de distância). */
const TOP_SPORTS_CLUB = {
  latitude: -30.0488,
  longitude: -51.2092,
};

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private geolocation: GeolocationService) {}

  /** Retorna as coordenadas da quadra TOP SPORTS CLUB. */
  getTopSportsClubCoords(): Coordenadas {
    return { ...TOP_SPORTS_CLUB };
  }

  /**
   * Obtém a localização atual do usuário.
   * Delega ao GeolocationService (GPS nativo ou navigator.geolocation no navegador).
   */
  async getCurrentPosition(): Promise<Coordenadas | null> {
    const result = await this.geolocation.getCurrentPosition();
    if (result.success && result.latitude != null && result.longitude != null) {
      return { latitude: result.latitude, longitude: result.longitude };
    }
    return null;
  }

  /**
   * Calcula a distância em km entre dois pontos (fórmula de Haversine).
   * Útil para exibir distância do usuário até a TOP SPORTS CLUB.
   */
  calcularDistanciaKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /** Distância do usuário até a TOP SPORTS CLUB. */
  async getDistanciaAteTopSportsClubKm(
    userLat: number,
    userLon: number
  ): Promise<number> {
    const club = this.getTopSportsClubCoords();
    return this.calcularDistanciaKm(
      userLat,
      userLon,
      club.latitude,
      club.longitude
    );
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
