import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-common-parallel-file-viewer',
  templateUrl: './common-parallel-file-viewer.component.html',
  styleUrls: ['./common-parallel-file-viewer.component.scss'],
  standalone: false,
})
export class CommonParallelFileViewerComponent {
  @Input() fileUrl = '';
  @Input() title = 'Document';
  @Output() closeViewer = new EventEmitter<void>();

  private readonly fileBaseUrl = environment.fileUrl;

  constructor(private $auth: AuthService) {}

  get normalizedUrl(): string {
    return this.normalizeUrl(this.fileUrl);
  }

  get isPdf(): boolean {
    return /\.pdf(?:$|[?#])/i.test(this.normalizedUrl);
  }

  get displayTitle(): string {
    return this.title || this.getFileName(this.normalizedUrl) || 'Document';
  }

  openInNewTab(): void {
    if (this.fileUrl) {
      this.$auth.viewFile(this.fileUrl);
    }
  }

  close(): void {
    this.closeViewer.emit();
  }

  private normalizeUrl(url: string): string {
    if (!url) {
      return '';
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const baseUrl = this.fileBaseUrl.endsWith('/') ? this.fileBaseUrl : `${this.fileBaseUrl}/`;
    return new URL(url.replace(/^\/+/, ''), baseUrl).toString();
  }

  private getFileName(url: string): string {
    if (!url) {
      return '';
    }

    try {
      const parsedUrl = new URL(url, this.fileBaseUrl);
      const fileName = parsedUrl.pathname.split('/').pop() || '';
      return decodeURIComponent(fileName);
    } catch {
      return '';
    }
  }
}
