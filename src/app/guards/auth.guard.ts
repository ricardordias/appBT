import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
/**
 * Guard que protege rotas internas: só permite acesso se o usuário estiver logado.
 * Caso contrário, redireciona para /login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loadSession().then(() => {
    const logged = auth.isLoggedIn();
    if (logged) return true;
    return router.createUrlTree(['/login']);
  }) as Promise<boolean | import('@angular/router').UrlTree>;
};
