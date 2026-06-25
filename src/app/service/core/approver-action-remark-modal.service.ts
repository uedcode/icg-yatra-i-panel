import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ApproverActionRemarkModalConfig {
  statusId: string;
  remark: string;
  requireForwardDeclarations?: boolean;
  showDteBalance?: boolean;
  dteBalance?: string | number | null;
}

interface ApproverActionRemarkModalRequest {
  config: ApproverActionRemarkModalConfig;
  resolve: (remark: string | null) => void;
}

@Injectable({ providedIn: 'root' })
export class ApproverActionRemarkModalService {
  private readonly requestSubject = new Subject<ApproverActionRemarkModalRequest>();

  readonly requests$: Observable<ApproverActionRemarkModalRequest> = this.requestSubject.asObservable();

  open(config: ApproverActionRemarkModalConfig): Promise<string | null> {
    return new Promise((resolve) => {
      this.requestSubject.next({ config, resolve });
    });
  }
}
