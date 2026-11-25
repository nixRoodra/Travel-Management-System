import { TestBed } from '@angular/core/testing';
import { StatusChip } from './status-chip';

describe('StatusChip', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChip],
    }).compileComponents();
  });

  it('renders readable text and semantic modifier class for PendingManagerApproval', async () => {
    const fixture = TestBed.createComponent(StatusChip);
    fixture.componentRef.setInput('status', 'PendingManagerApproval');
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector('.tms-status-badge') as HTMLElement;
    expect(badge.textContent).toContain('Pending Manager Approval');
    expect(badge.classList.contains('tms-status-badge--pending-manager')).toBe(true);
  });

  it('falls back gracefully for unknown statuses', async () => {
    const fixture = TestBed.createComponent(StatusChip);
    fixture.componentRef.setInput('status', 'CustomStatus');
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector('.tms-status-badge') as HTMLElement;
    expect(badge.textContent).toContain('CustomStatus');
  });
});
