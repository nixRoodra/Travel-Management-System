import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ReceiptViewerDialog,
  ReceiptViewerDialogData,
} from './receipt-viewer-dialog';

describe('ReceiptViewerDialog', () => {
  const samplePdfData: ReceiptViewerDialogData = {
    fileName: 'ticket.pdf',
    blob: new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }),
  };

  const sampleImageData: ReceiptViewerDialogData = {
    fileName: 'receipt.png',
    blob: new Blob(['fake-image-bytes'], { type: 'image/png' }),
  };

  function setup(data: ReceiptViewerDialogData) {
    const dialogRefSpy = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ReceiptViewerDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    });

    const fixture = TestBed.createComponent(ReceiptViewerDialog);
    fixture.detectChanges();
    return { fixture, dialogRefSpy };
  }

  it('renders iframe for PDF receipts without download trigger', () => {
    const { fixture } = setup(samplePdfData);
    const iframe = fixture.nativeElement.querySelector('iframe');
    expect(iframe).toBeTruthy();

    const title = fixture.nativeElement.querySelector('.viewer-title');
    expect(title.textContent).toContain('ticket.pdf');
  });

  it('renders preview image for image receipts', () => {
    const { fixture } = setup(sampleImageData);
    const img = fixture.nativeElement.querySelector('img.receipt-preview-img');
    expect(img).toBeTruthy();

    const title = fixture.nativeElement.querySelector('.viewer-title');
    expect(title.textContent).toContain('receipt.png');
  });
});
