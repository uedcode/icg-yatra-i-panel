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
    const baseUrl = String(moduleUrl || '').replace(/\/$/, '');
    const cleanRoute = String(route || '').replace(/^\/+/, '');
    const query = Object.entries(queryParams)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    const url = `${baseUrl}/${cleanRoute}${query ? `?${query}` : ''}`;
    window.open(url, '_blank');
  }
}
