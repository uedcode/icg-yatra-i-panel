import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-common-view-file',
    templateUrl: './common-view-file.component.html',
    styleUrls: ['./common-view-file.component.scss'],
    standalone: false
})
export class CommonViewFileComponent implements OnInit, AfterViewInit  {

  constructor(private route: ActivatedRoute) { }

  url;
  docUrl;
  imgUrl;
  private readonly fileBaseUrl = environment.fileUrl;
  ngOnInit() {
    let id = this.route.snapshot.params['id'];
    this.url = this.normalizeUrl(this.safeDecode(id));
    if (!this.url) {
      return;
    }
    if (this.url.includes(".pdf") || this.url.includes(".PDF")) {
      this.docUrl = this.url
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
    let url = "";
    if (this.url.includes(".pdf") || this.url.includes(".PDF")) {
      url = this.docUrl
    } else {
      url = this.imgUrl;
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
      });


  }

  private safeDecode(value: string): string {
    try {
      return atob(value || '');
    } catch {
      return '';
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

  ngAfterViewInit(): void {
    // setTimeout(() => {
      let dialogContainer = document.getElementById('dialogContainer');
      if (dialogContainer) {
        dialogContainer.style.display = 'none';
      }
    // }, 100);
  }

}

