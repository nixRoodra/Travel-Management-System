import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getStatusDisplayMeta, TmsStatus } from '../../models/status.model';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="tms-status-badge"
      [class]="meta().cssModifier"
      role="status"
      [attr.aria-label]="'Status: ' + meta().label"
    >
      <mat-icon class="status-icon" aria-hidden="true">{{ meta().icon }}</mat-icon>
      <span>{{ meta().label }}</span>
    </span>
  `,
  styles: `
    .status-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      line-height: 14px;
    }
  `,
})
export class StatusChip {
  readonly status = input.required<TmsStatus | string>();
  protected readonly meta = computed(() => getStatusDisplayMeta(this.status()));
}
