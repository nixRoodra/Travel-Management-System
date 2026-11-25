import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../shared/models/role.model';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopToolbar } from '../../components/top-toolbar/top-toolbar';
import { NAV_SECTIONS } from '../../navigation.config';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, Sidebar, TopToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  private readonly sidenav = viewChild(MatSidenav);

  protected readonly navSections = NAV_SECTIONS;

  protected readonly userName = computed(() => this.authService.user()?.fullName ?? 'User');
  protected readonly userEmail = computed(() => this.authService.user()?.email ?? '');
  protected readonly userRole = computed<UserRole>(
    () => this.authService.user()?.role ?? 'Employee',
  );

  protected readonly isHandset = toSignal(
    this.breakpointObserver
      .observe('(max-width: 959.98px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected onMenuToggle(): void {
    this.sidenav()?.toggle();
  }

  protected onNavItemSelected(): void {
    if (this.isHandset()) {
      this.sidenav()?.close();
    }
  }

  protected onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.notifications.info('You have been signed out.');
    });
  }
}
