import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserRole } from '../../../shared/models/role.model';

@Component({
  selector: 'app-top-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-toolbar.html',
  styleUrl: './top-toolbar.scss',
})
export class TopToolbar {
  readonly isHandset = input<boolean>(false);
  readonly userName = input.required<string>();
  readonly userEmail = input<string>('');
  readonly userRole = input.required<UserRole>();

  readonly menuToggle = output<void>();
  readonly logout = output<void>();

  protected readonly initials = computed(() => {
    const parts = this.userName().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });
}
