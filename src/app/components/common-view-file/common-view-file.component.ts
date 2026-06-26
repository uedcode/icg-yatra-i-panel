import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit } from '@angular/core';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-view-file',
    templateUrl: './common-view-file.component.html',
    styleUrls: ['./common-view-file.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonViewFileComponent implements OnInit, AfterViewInit  {

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private previewWindow: PreviewWindowService
  ) {}

  url = '';
  docUrl: string | undefined;
  imgUrl: string | undefined;
  readonly pdfViewerHeight = 'calc(100vh - 58px)';
  private readonly fileBaseUrl = environment.fileUrl;

  ngOnInit() {
    const id =
      this.route.snapshot.paramMap?.get('id') ||
      this.route.snapshot.params?.['id'] ||
      this.route.snapshot.queryParamMap?.get('file') ||
      '';

    this.url = this.normalizeUrl(this.safeDecode(id));
    if (!this.url) {
      return;
    }

    if (this.isPdf(this.url)) {
      this.docUrl = this.url;
    } else {
      this.imgUrl = this.url;
    }
  }


  getFileNameFromUrl(url: string): string {
    const parsedUrl = new URL(url, this.fileBaseUrl);
    const pathParts = parsedUrl.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    return fileName;
  }

  download() {
    const url = this.docUrl || this.imgUrl;
    if (!url) {
      return;
    }

    fetch(url).then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;

        let fileName = this.getFileNameFromUrl(url);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch(() => {
        this.openFile();
      });
  }

  goBack(): void {
    this.previewWindow.closeOrBack(this.location);
  }

  private openFile() {
    if (this.url) {
      window.open(this.url, '_blank');
    }
  }

  private safeDecode(value: string): string {
    const encodedValue = this.safeDecodeURIComponent(value || '');
    const legacyCompatibleBase64 = encodedValue
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddingLength = (4 - (legacyCompatibleBase64.length % 4)) % 4;
    const paddedValue = `${legacyCompatibleBase64}${'='.repeat(paddingLength)}`;

    try {
      return atob(paddedValue);
    } catch {
      return '';
    }
  }

  private safeDecodeURIComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
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

  private isPdf(url: string): boolean {
    return /\.pdf(?:$|[?#])/i.test(url);
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
      let dialogContainer = document.getElementById('dialogContainer');
      if (dialogContainer) {
        dialogContainer.style.display = 'none';
      }
    // }, 100);
  }

}

