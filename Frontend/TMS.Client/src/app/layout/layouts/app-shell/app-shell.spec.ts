import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppShell } from './app-shell';

describe('AppShell Responsive Layout', () => {
  let breakpoint$: BehaviorSubject<BreakpointState>;

  beforeEach(async () => {
    breakpoint$ = new BehaviorSubject<BreakpointState>({
      matches: false,
      breakpoints: {},
    });

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpoint$.asObservable() },
        },
        {
          provide: AuthService,
          useValue: {
            user: () => ({
              userId: 1,
              employeeId: 10,
              fullName: 'Alex Morgan',
              email: 'alex@company.com',
              role: 'Employee',
            }),
            logout: vi.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('renders skip-to-main link and switches sidenav mode between desktop and mobile', async () => {
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const skipLink = host.querySelector('a.skip-link') as HTMLAnchorElement;
    expect(skipLink?.getAttribute('href')).toBe('#main-content');

    const comp = fixture.componentInstance as unknown as {
      isHandset: () => boolean;
    };
    expect(comp.isHandset()).toBe(false);
    expect(host.querySelector('button[aria-label="Toggle navigation menu"]')).toBeNull();

    // Switch to mobile viewport (< 960px)
    breakpoint$.next({ matches: true, breakpoints: {} });
    fixture.detectChanges();

    expect(comp.isHandset()).toBe(true);
    expect(host.querySelector('button[aria-label="Toggle navigation menu"]')).not.toBeNull();
  });
});
