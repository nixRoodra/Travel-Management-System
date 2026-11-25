import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbItem } from '../../models/navigation.model';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      @if (breadcrumbs().length > 0) {
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
            @if (crumb.route && !last) {
              <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
            } @else {
              <span class="breadcrumb-current" [attr.aria-current]="last ? 'page' : null">
                {{ crumb.label }}
              </span>
            }
            @if (!last) {
              <mat-icon class="breadcrumb-separator" aria-hidden="true">chevron_right</mat-icon>
            }
          }
        </nav>
      }

      <div class="header-row">
        <div class="title-group">
          <h1 class="page-title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="page-subtitle">{{ subtitle() }}</p>
          }
        </div>
        <div class="header-actions">
          <ng-content />
        </div>
      </div>
    </header>
  `,
  styles: `
    .page-header {
      margin-bottom: var(--tms-space-6);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: var(--tms-space-2);
      font-size: 0.8125rem;
      color: var(--tms-text-muted);
    }

    .breadcrumb-link {
      color: var(--tms-text-secondary);
      text-decoration: none;
      font-weight: 500;

      &:hover {
        color: var(--tms-brand-primary);
        text-decoration: underline;
      }
    }

    .breadcrumb-current {
      color: var(--tms-text-primary);
      font-weight: 500;
    }

    .breadcrumb-separator {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--tms-text-muted);
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--tms-space-4);
      flex-wrap: wrap;
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -0.015em;
      color: var(--tms-text-primary);
    }

    .page-subtitle {
      margin: 4px 0 0;
      font-size: 0.875rem;
      color: var(--tms-text-secondary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--tms-space-2);
      flex-wrap: wrap;
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
}
