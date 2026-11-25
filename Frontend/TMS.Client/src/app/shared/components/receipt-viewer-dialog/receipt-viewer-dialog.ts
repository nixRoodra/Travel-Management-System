import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface ReceiptViewerDialogData {
  fileName: string;
  blob: Blob;
}

@Component({
  selector: 'app-receipt-viewer-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="receipt-viewer-header">
      <div class="title-wrap">
        <mat-icon class="header-icon">
          {{ isPdf ? 'picture_as_pdf' : isImage ? 'image' : 'receipt_long' }}
        </mat-icon>
        <h2 mat-dialog-title class="viewer-title">{{ data.fileName }}</h2>
      </div>
      <button
        mat-icon-button
        type="button"
        mat-dialog-close
        aria-label="Close receipt viewer"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="receipt-viewer-content">
      @if (isPdf && safeUrl) {
        <iframe
          [src]="safeUrl"
          class="receipt-frame"
          title="Receipt PDF Preview"
        ></iframe>
      } @else if (isImage && safeUrl) {
        <div class="receipt-image-container">
          <img
            [src]="safeUrl"
            [alt]="data.fileName"
            class="receipt-preview-img"
          />
        </div>
      } @else {
        <div class="unsupported-box">
          <mat-icon class="unsupported-icon">description</mat-icon>
          <p>Preview is not directly viewable in the dialog.</p>
          <button mat-flat-button color="primary" type="button" (click)="openInNewTab()">
            <mat-icon>open_in_new</mat-icon>
            Open in New Window
          </button>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="receipt-viewer-actions">
      <button mat-button type="button" (click)="openInNewTab()">
        <mat-icon>open_in_new</mat-icon>
        Open in New Tab
      </button>
      <button mat-flat-button type="button" mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .receipt-viewer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 8px 20px;
      border-bottom: 1px solid var(--tms-border-subtle, #e0e0e0);

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        overflow: hidden;
      }

      .header-icon {
        color: var(--tms-color-primary, #005fb8);
        flex-shrink: 0;
      }

      .viewer-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .receipt-viewer-content {
      padding: 16px;
      min-width: 320px;
      min-height: 240px;
      max-height: 72vh;
      overflow: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--tms-bg-canvas, #f8f9fa);
    }

    .receipt-frame {
      width: 100%;
      height: 68vh;
      min-width: 600px;
      border: none;
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .receipt-image-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .receipt-preview-img {
      max-width: 100%;
      max-height: 68vh;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      background-color: #fff;
    }

    .unsupported-box {
      text-align: center;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .unsupported-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--tms-text-muted, #757575);
      }
    }

    .receipt-viewer-actions {
      padding: 8px 16px 12px;
      border-top: 1px solid var(--tms-border-subtle, #e0e0e0);
      gap: 8px;
    }

    @media (max-width: 640px) {
      .receipt-frame {
        min-width: 280px;
        height: 55vh;
      }
    }
  `,
})
export class ReceiptViewerDialog implements OnInit, OnDestroy {
  protected readonly data: ReceiptViewerDialogData = inject(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ReceiptViewerDialog>);
  private readonly sanitizer = inject(DomSanitizer);

  protected objectUrl: string | null = null;
  protected safeUrl: SafeResourceUrl | null = null;
  protected isPdf = false;
  protected isImage = false;

  ngOnInit(): void {
    const ext = this.data.fileName.toLowerCase();
    this.isPdf = ext.endsWith('.pdf') || this.data.blob.type === 'application/pdf';
    this.isImage =
      ext.endsWith('.jpg') ||
      ext.endsWith('.jpeg') ||
      ext.endsWith('.png') ||
      ext.endsWith('.webp') ||
      this.data.blob.type.startsWith('image/');

    this.objectUrl = URL.createObjectURL(this.data.blob);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  protected openInNewTab(): void {
    if (this.objectUrl) {
      window.open(this.objectUrl, '_blank');
    }
  }
}
