import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NAV_SECTIONS } from '../../navigation.config';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows employee workspace items and hides finance/admin items for Employee role', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('sections', NAV_SECTIONS);
    fixture.componentRef.setInput('currentRole', 'Employee');
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Dashboard');
    expect(text).toContain('Travel Requests');
    expect(text).toContain('My Trips');
    expect(text).not.toContain('Team Approvals');
    expect(text).not.toContain('Expense Reviews');
    expect(text).not.toContain('Employees');
  });

  it('shows Finance navigation and hides Employee travel items for Finance role', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('sections', NAV_SECTIONS);
    fixture.componentRef.setInput('currentRole', 'Finance');
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Dashboard');
    expect(text).toContain('Travel Approvals');
    expect(text).toContain('Expense Reviews');
    expect(text).not.toContain('My Trips');
    expect(text).not.toContain('Employees');
  });
});
