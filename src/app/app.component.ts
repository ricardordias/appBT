import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
  MenuController,
} from '@ionic/angular/standalone';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly menuController = inject(MenuController);

  ngOnInit(): void {
    this.notification.requestPermissions().catch((err) => {
      console.warn('[AppComponent] Falha ao solicitar permissão de notificação:', err);
    });

    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects ?? e.url ?? '';
        const hideMenu = url.includes('/login') || url.includes('/register');
        this.menuController.enable(!hideMenu, 'main-menu').catch(() => {});
      });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
  }
}
