import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

/**
 * Guard que restringe acesso apenas a usuários do tipo admin.
 * Se não estiver logado, redireciona para /login.
 * Se estiver logado mas não for admin, redireciona para /home e exibe toast "Acesso restrito".
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastController);

  return auth.loadSession().then(() => {
    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
    if (!auth.isAdmin()) {
      toast.create({
        message: 'Acesso restrito. Área exclusiva do administrador.',
        duration: 3000,
        color: 'warning',
      }).then((t) => t.present());
      return router.createUrlTree(['/home']);
    }
    return true;
  }) as Promise<boolean | import('@angular/router').UrlTree>;
};
