import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormApiService } from 'src/app/service/api/form/form-api.service';
import { FormStateApiService } from 'src/app/service/api/form/form-state-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FormWorkflowService {
  constructor(
    private $form: FormApiService,
    private $formState: FormStateApiService,
    private $auth: AuthService
  ) {}

  loadFormDetails(params: {
    id?: string;
    subFormId?: string;
    supId?: string;
    userContext?: any;
  }): Observable<any> {
    const userContext = params.userContext || this.$auth.getUserDetails();
    const headers: any = {
      roleTypeId: userContext?.roleTypeId,
      desigId: userContext?.desigId,
      roleId: userContext?.roleId,
    };

    if (params.id) {
      headers.formId = params.id;
    }
    if (params.supId) {
      headers.formId = params.supId;
    }
    if (params.subFormId) {
      headers.codeSubFormId = params.subFormId;
    }
    if (userContext?.roleTypeId === 'CR') {
      headers.userId = userContext?.userId;
    }

    return this.$form
      .getSingleForm({ headers })
      .pipe(map((response: any) => response?.object?.[0] || null));
  }

  loadFormStates(status: string, userContext?: any): Observable<any[]> {
    const details = userContext || this.$auth.getUserDetails();
    const codeRoleType = this.$auth.codeRoleType();
    const headers: any = {
      roleTypeId: details?.roleTypeId,
      desigId: details?.desigId,
      status,
    };

    if (details?.roleTypeId === codeRoleType?.creator) {
      headers.userId = details?.userId;
    }
    if (details?.roleTypeId !== codeRoleType?.creator) {
      headers.unitId = details?.unitId;
    }

    return this.$formState
      .getState({ headers })
      .pipe(map((response: any) => response?.object || []));
  }

  submitForm(req: any, requiredDocs: any[] = [], uploadedDocs: any[] = []): Observable<any> {
    const pendingDocNames = this.getPendingRequiredDocumentNames(requiredDocs, uploadedDocs);
    if (req?.formStateInputDTO?.status === 'OB' && pendingDocNames.length > 0) {
      return throwError(
        () => new Error(`Please Upload Required Document - ${pendingDocNames.join(', ')}`)
      );
    }

    const userContext = this.$auth.getUserDetails();
    const payload = {
      ...req,
      cadre: userContext?.cadre,
      ...(uploadedDocs.length > 0 ? { formDocsDTOs: uploadedDocs } : {}),
    };

    return this.$form.createOrUpdate(payload).pipe(
      map((response: any) => ({
        response,
        object: {
          ...response?.object?.[0],
          formStateInputDTO: req?.formStateInputDTO,
        },
      }))
    );
  }

  getSignedFormDownloadLink(formId: string): Observable<any> {
    return this.$form.getSignedFormDownloadLink(formId).pipe(
      map((response: any) => response?.object)
    );
  }

  private getPendingRequiredDocumentNames(requiredDocs: any[], uploadedDocs: any[]): string[] {
    if (!Array.isArray(requiredDocs) || requiredDocs.length === 0) {
      return [];
    }

    return requiredDocs
      .filter(
        (doc) =>
          doc?.isRequired === 'Yes' &&
          !uploadedDocs.find(
            (uploadedDoc) =>
              uploadedDoc?.codeDocInfoDTO?.id === doc.id ||
              uploadedDoc?.codeDocInfoDTO?.docName?.toLowerCase() ===
                doc.docName?.toLowerCase()
          )
      )
      .map((doc) => doc.docName);
  }
}
