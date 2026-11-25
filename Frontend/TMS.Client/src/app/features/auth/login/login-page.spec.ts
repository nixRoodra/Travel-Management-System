import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let loginSpy: ReturnType<typeof vi.fn>;
  let notifySuccessSpy: ReturnType<typeof vi.fn>;
  let router: Router;

  function setup(returnUrl: string | null = null) {
    loginSpy = vi.fn();
    notifySuccessSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { login: loginSpy },
        },
        {
          provide: NotificationService,
          useValue: { success: notifySuccessSpy, error: vi.fn(), info: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'returnUrl' ? returnUrl : null),
              },
            },
          },
        },
      ],
    });

    router = TestBed.inject(Router);
    return TestBed.createComponent(LoginPage);
  }

  it('does not call AuthService.login when form is invalid', async () => {
    const fixture = setup();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as { onSubmit: () => void };
    component.onSubmit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('navigates to safe returnUrl on successful login', async () => {
    const fixture = setup('/my-trips');
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    loginSpy.mockReturnValue(
      of({
        userId: 1,
        employeeId: 10,
        fullName: 'Alice Smith',
        email: 'alice@company.com',
        role: 'Employee',
      }),
    );

    const component = fixture.componentInstance as unknown as {
      loginForm: { setValue: (v: { email: string; password: string }) => void };
      onSubmit: () => void;
    };
    component.loginForm.setValue({ email: 'alice@company.com', password: 'Password123!' });
    component.onSubmit();
    await fixture.whenStable();

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'alice@company.com',
      password: 'Password123!',
    });
    expect(notifySuccessSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/my-trips');
  });

  it('displays API error message when login fails', async () => {
    const fixture = setup();
    loginSpy.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { detail: 'Invalid email or password.' },
          }),
      ),
    );

    const component = fixture.componentInstance as unknown as {
      loginForm: { setValue: (v: { email: string; password: string }) => void };
      onSubmit: () => void;
    };
    component.loginForm.setValue({ email: 'alice@company.com', password: 'wrong' });
    component.onSubmit();
    fixture.detectChanges();

    const alertEl = fixture.nativeElement.querySelector('.error-banner') as HTMLElement;
    expect(alertEl).not.toBeNull();
    expect(alertEl.textContent).toContain('Invalid email or password.');
  });
});
