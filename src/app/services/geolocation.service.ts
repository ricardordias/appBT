import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type PlatformKind = 'web' | 'android' | 'ios';

export interface GeolocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  message?: string;
}

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * Serviço dedicado ao GPS do dispositivo.
 * Utiliza @capacitor/geolocation em nativo e navigator.geolocation no navegador.
 * Inclui solicitação explícita de permissão, tratamento de erros e mensagens amigáveis.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  /** Detecta se está em navegador, Android ou iOS. */
  getPlatform(): PlatformKind {
    const p = Capacitor.getPlatform();
    if (p === 'android') return 'android';
    if (p === 'ios') return 'ios';
    return 'web';
  }

  /** Indica se está rodando em navegador (ex.: ionic serve). */
  isWeb(): boolean {
    return this.getPlatform() === 'web';
  }

  /**
   * Solicita permissão de localização explicitamente.
   * No navegador não há API para pedir antes; o prompt aparece ao chamar getCurrentPosition.
   */
  async requestPermissions(): Promise<PermissionResult> {
    try {
      if (this.isWeb()) {
        console.log('[GeolocationService] Navegador: permissão será solicitada ao obter posição.');
        return { granted: true };
      }
      const status = await Geolocation.requestPermissions();
      const granted = status.location === 'granted' || status.coarseLocation === 'granted';
      if (!granted) {
        console.warn('[GeolocationService] Permissão de localização negada.');
        return {
          granted: false,
          message: 'Permissão de localização foi negada. Ative nas configurações do dispositivo para usar o GPS.',
        };
      }
      console.log('[GeolocationService] Permissão de localização concedida.');
      return { granted: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao solicitar permissão de localização.';
      console.error('[GeolocationService] requestPermissions error:', err);
      return {
        granted: false,
        message: 'Não foi possível solicitar permissão. Verifique se o GPS está ativado.',
      };
    }
  }

  /**
   * Obtém a localização atual do dispositivo.
   * Em navegador usa navigator.geolocation; em Android/iOS usa Capacitor Geolocation.
   * Inclui tratamento de erro e mensagens amigáveis para demonstração acadêmica.
   */
  async getCurrentPosition(): Promise<GeolocationResult> {
    try {
      if (this.isWeb()) {
        return await this.getCurrentPositionWeb();
      }
      const perm = await this.requestPermissions();
      if (!perm.granted) {
        return { success: false, message: perm.message ?? 'Permissão negada.' };
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log('[GeolocationService] Posição obtida (nativo):', lat, lon);
      return { success: true, latitude: lat, longitude: lon };
    } catch (err) {
      const message = this.getFriendlyGeoError(err);
      console.error('[GeolocationService] getCurrentPosition error:', err);
      return { success: false, message };
    }
  }

  /** Fallback para navegador: usa navigator.geolocation. */
  private getCurrentPositionWeb(): Promise<GeolocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('[GeolocationService] navigator.geolocation não disponível.');
        resolve({
          success: false,
          message: 'Seu navegador não suporta geolocalização. Use HTTPS ou localhost.',
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          console.log('[GeolocationService] Posição obtida (navegador):', lat, lon);
          resolve({ success: true, latitude: lat, longitude: lon });
        },
        (err) => {
          const message = this.getFriendlyGeoError(err);
          console.warn('[GeolocationService] getCurrentPosition (web) error:', err);
          resolve({ success: false, message });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  private getFriendlyGeoError(err: unknown): string {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: number }).code;
      if (code === 1) return 'Permissão de localização negada. Ative nas configurações do site ou do dispositivo.';
      if (code === 2) return 'Posição indisponível. Verifique se o GPS está ativado e tente novamente.';
      if (code === 3) return 'Tempo esgotado ao obter localização. Tente novamente em um lugar com melhor sinal.';
    }
    return 'Não foi possível obter a localização. Tente novamente mais tarde.';
  }
}
