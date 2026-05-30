import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  generateBrowserId(): string {
    const ua = navigator.userAgent;
    let uniqueId = '';

    // Concatenate relevant browser information
    uniqueId += navigator.vendor || '';
    uniqueId += navigator.platform || '';
    uniqueId += ua.replace(/\s/g, ''); // Remove spaces from user agent

    // Hash the concatenated string to get a unique identifier
    let hash = 0;
    for (let i = 0; i < uniqueId.length; i++) {
      hash = ((hash << 5) - hash) + uniqueId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return hash.toString(16); // Convert to hexadecimal string
  }

}

