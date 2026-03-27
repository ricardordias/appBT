import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage) },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'partidas',
    loadComponent: () => import('./pages/partidas/partidas.page').then((m) => m.PartidasPage),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
    canActivate: [authGuard],
  },
  {
    path: 'criar-partida',
    loadComponent: () => import('./pages/criar-partida/criar-partida.page').then((m) => m.CriarPartidaPage),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/quadras',
    loadComponent: () => import('./pages/admin-quadras/admin-quadras.page').then((m) => m.AdminQuadrasPage),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/interessados',
    loadComponent: () => import('./pages/admin-interessados/admin-interessados.page').then((m) => m.AdminInteressadosPage),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/demo-etapa3',
    loadComponent: () => import('./pages/demo-etapa3/demo-etapa3.page').then((m) => m.DemoEtapa3Page),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '/home' },
];
