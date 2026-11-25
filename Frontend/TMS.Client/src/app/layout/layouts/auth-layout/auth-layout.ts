import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-layout">
      <main class="auth-card-wrapper">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--tms-space-6);
      background-color: var(--tms-bg-canvas);
    }

    .auth-card-wrapper {
      width: 100%;
      max-width: 420px;
    }
  `,
})
export class AuthLayout {}
