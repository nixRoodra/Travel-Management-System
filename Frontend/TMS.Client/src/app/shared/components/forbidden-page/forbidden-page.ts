import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../empty-state/empty-state';
import { PageHeader } from '../page-header/page-header';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Access Denied"
      subtitle="You do not have permission to view this page."
      [breadcrumbs]="[{ label: 'Dashboard', route: '/dashboard' }, { label: 'Access Denied' }]"
    />

    <app-empty-state
      icon="gpp_bad"
      title="403 — Restricted Workspace"
      message="Your current role does not grant access to this section. Contact an administrator if you believe this is an error."
    >
      <a mat-flat-button color="primary" routerLink="/dashboard">Go to Dashboard</a>
    </app-empty-state>
  `,
})
export class ForbiddenPage {}
