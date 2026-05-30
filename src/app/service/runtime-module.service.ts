import { Injectable } from '@angular/core';

export type RuntimeModuleId = 'ADV' | 'CLM';

@Injectable({
  providedIn: 'root',
})
export class RuntimeModuleService {
  private readonly moduleCode = {
    advance: 'ADV' as RuntimeModuleId,
    claim: 'CLM' as RuntimeModuleId,
  };

  getModuleId(pathname: string = window.location.pathname): RuntimeModuleId {
    const path = String(pathname || '').toLowerCase();
    if (path.includes('claim')) {
      return this.moduleCode.claim;
    }
    return this.moduleCode.advance;
  }

  isAdv(pathname?: string): boolean {
    return this.getModuleId(pathname) === this.moduleCode.advance;
  }

  isClm(pathname?: string): boolean {
    return this.getModuleId(pathname) === this.moduleCode.claim;
  }

  isModuleEnabled(moduleId: string, pathname?: string): boolean {
    const requested = String(moduleId || '').toUpperCase();
    const active = this.getModuleId(pathname);
    if (!requested) {
      return false;
    }
    if (requested === 'COM') {
      return true;
    }
    return requested === active;
  }
}


