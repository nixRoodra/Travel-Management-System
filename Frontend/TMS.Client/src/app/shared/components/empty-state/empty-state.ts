import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state tms-card" role="region" [attr.aria-label]="title()">
      <div class="icon-wrapper">
        <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      </div>
      <h2 class="empty-title">{{ title() }}</h2>
      @if (message()) {
        <p class="empty-message">{{ message() }}</p>
      }
      <div class="empty-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--tms-space-8) var(--tms-space-6);
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--tms-radius-pill);
      background-color: var(--tms-bg-subtle);
      color: var(--tms-text-secondary);
      margin-bottom: var(--tms-space-4);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .empty-title {
      margin: 0 0 var(--tms-space-2);
      font-size: 1rem;
      font-weight: 600;
      color: var(--tms-text-primary);
    }

    .empty-message {
      margin: 0 0 var(--tms-space-5);
      max-width: 420px;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--tms-text-secondary);
    }

    .empty-actions {
      display: flex;
      gap: var(--tms-space-2);
      flex-wrap: wrap;
      justify-content: center;
    }
  `,
})
export class EmptyState {
  readonly icon = input<string>('inbox');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
