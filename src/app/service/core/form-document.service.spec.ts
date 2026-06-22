import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { TempDocInfoApiService } from 'src/app/service/api/form/temp-doc-info-api.service';
import { FormDocumentService } from './form-document.service';

describe('FormDocumentService', () => {
  let service: FormDocumentService;
  let tempDocInfoApi: jasmine.SpyObj<TempDocInfoApiService>;
  let codeDocInfoApi: jasmine.SpyObj<CodeDocInfoApiService>;

  beforeEach(() => {
    tempDocInfoApi = jasmine.createSpyObj<TempDocInfoApiService>('TempDocInfoApiService', [
      'createOrUpdate'
    ]);
    codeDocInfoApi = jasmine.createSpyObj<CodeDocInfoApiService>('CodeDocInfoApiService', [
      'getDocument'
    ]);

    tempDocInfoApi.createOrUpdate.and.returnValue(
      of({ status: true, object: [{ fileUrl: 'claim/TEMP/support_doc/gx.pdf' }] })
    );
    codeDocInfoApi.getDocument.and.returnValue(of({ status: true, object: [] }));

    TestBed.configureTestingModule({
      providers: [
        FormDocumentService,
        { provide: TempDocInfoApiService, useValue: tempDocInfoApi },
        { provide: CodeDocInfoApiService, useValue: codeDocInfoApi }
      ]
    });

    service = TestBed.inject(FormDocumentService);
  });

  it('uploads a temp document using legacy tempDocInfo multipart keys', () => {
    const file = new File(['pdf'], 'gx.pdf', { type: 'application/pdf' });
    let actual: string | null = null;

    service.uploadTempDocument(file).subscribe((url) => (actual = url));

    expect(tempDocInfoApi.createOrUpdate).toHaveBeenCalled();
    const formData = tempDocInfoApi.createOrUpdate.calls.mostRecent().args[0] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(JSON.parse(formData.get('tempDocInfoDTO') as string)).toEqual({});
    expect(actual).toBe('claim/TEMP/support_doc/gx.pdf');
  });

  it('passes claim folderId for claim supporting document temp upload', () => {
    const file = new File(['pdf'], 'support.pdf', { type: 'application/pdf' });

    service.uploadTempDocument(file, 'C_ID_1').subscribe();

    const formData = tempDocInfoApi.createOrUpdate.calls.mostRecent().args[0] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(JSON.parse(formData.get('tempDocInfoDTO') as string)).toEqual({
      folderId: 'C_ID_1'
    });
  });

  it('keeps uploadSupportDoc as a legacy temp upload alias for existing form callers', () => {
    const file = new File(['pdf'], 'gx.pdf', { type: 'application/pdf' });

    service.uploadSupportDoc(file).subscribe();

    const formData = tempDocInfoApi.createOrUpdate.calls.mostRecent().args[0] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.has('docFile')).toBeFalse();
    expect(formData.has('SupportDocDTO')).toBeFalse();
  });

  it('loads required document flags from codeDocInfo directly', () => {
    service.loadRequiredDocuments('TYD').subscribe();

    expect(codeDocInfoApi.getDocument).toHaveBeenCalledOnceWith({
      headers: {
        tyClaim: '1',
        pmtClaim: '',
        ltcClaim: '',
        resettleClm: '',
        fteClaim: ''
      }
    });
  });

  it('does not call a backend delete endpoint for temp document references', () => {
    let actual = false;

    service.deleteSupportDocByUrl('claim/TEMP/support_doc/gx.pdf').subscribe((deleted) => {
      actual = deleted;
    });

    expect(actual).toBeTrue();
    expect(tempDocInfoApi.createOrUpdate).not.toHaveBeenCalled();
  });
});
