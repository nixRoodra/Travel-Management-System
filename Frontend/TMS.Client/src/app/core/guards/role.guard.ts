import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../shared/models/role.model';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: state.url && state.url !== '/' ? { returnUrl: state.url } : undefined,
    });
  }

  const allowedRoles = route.data['roles'] as readonly UserRole[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentRole = authService.userRole();
  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
