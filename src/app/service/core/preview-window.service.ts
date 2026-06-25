import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PreviewWindowService {
  closeOrBack(location: Location): void {
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    if (window.history.length > 1) {
      location.back();
      return;
    }

    window.close();
  }

  open(moduleUrl: string, route: string, queryParams: Record<string, any>): void {
    const url = this.buildUrl(moduleUrl, route, queryParams);
    window.open(url, '_blank');
  }

  openUrl(url: string): void {
    window.open(this.buildUrlFromRaw(url), '_blank');
  }

  buildUrl(
    moduleUrl: string,
    route: string,
    queryParams: Record<string, any>,
    pathname: string = String(window.location?.pathname || '')
  ): string {
    const baseUrl = this.withRuntimePrefix(String(moduleUrl || '').replace(/\/$/, ''), pathname);
    const cleanRoute = String(route || '').replace(/^\/+/, '');
    const query = Object.entries(queryParams)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    return `${baseUrl}/${cleanRoute}${query ? `?${query}` : ''}`;
  }

  buildUrlFromRaw(url: string, pathname: string = String(window.location?.pathname || '')): string {
    const rawUrl = String(url || '');
    if (!rawUrl.startsWith('/')) {
      return rawUrl;
    }
    if (rawUrl.startsWith('/adv/') || rawUrl.startsWith('/claim/')) {
      return rawUrl;
    }
    if (!rawUrl.startsWith('/creator/') && !rawUrl.startsWith('/approver/')) {
      return rawUrl;
    }

    const runtimePrefix = this.getRuntimePrefix(pathname);
    return runtimePrefix ? `${runtimePrefix}${rawUrl}` : rawUrl;
  }

  private withRuntimePrefix(moduleUrl: string, pathname: string): string {
    const cleanModuleUrl = `/${String(moduleUrl || '').replace(/^\/+|\/+$/g, '')}`;
    if (cleanModuleUrl === '/') {
      return '';
    }
    if (cleanModuleUrl.startsWith('/adv/') || cleanModuleUrl.startsWith('/claim/')) {
      return cleanModuleUrl;
    }

    const runtimePrefix = this.getRuntimePrefix(pathname);
    return runtimePrefix ? `${runtimePrefix}${cleanModuleUrl}` : cleanModuleUrl;
  }

  private getRuntimePrefix(pathname: string): string {
    const path = String(pathname || '').toLowerCase();
    if (path.startsWith('/claim/')) {
      return '/claim';
    }
    if (path.startsWith('/adv/')) {
      return '/adv';
    }
    return '';
  }
}
