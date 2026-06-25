import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CommonEsignModalComponent } from './common-esign-modal.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ESignFlowService } from 'src/app/service/core/esign-flow.service';

describe('CommonEsignModalComponent', () => {
  let component: CommonEsignModalComponent;
  let fixture: ComponentFixture<CommonEsignModalComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let eSignFlow: jasmine.SpyObj<ESignFlowService>;
  let modalSpy: jasmine.Spy;

  beforeEach(async () => {
    modalSpy = jasmine.createSpy('modal');
    (window as any).$ = jasmine.createSpy('$').and.returnValue({ modal: modalSpy });

    authService = jasmine.createSpyObj('AuthService', ['getUserDetails', 'getModuleName', 'viewFile']);
    eSignFlow = jasmine.createSpyObj('ESignFlowService', ['start', 'perform']);

    authService.getUserDetails.and.returnValue({
      roleTypeId: 'VE2',
      userId: 'U1',
      desigId: 'D1',
      financialYear: '2026',
      moduleId: 'CLM',
      unitId: 'UNIT',
      personName: 'Verifier',
    } as any);
    authService.getModuleName.and.returnValue('/claim/approver' as any);

    await TestBed.configureTestingModule({
      declarations: [CommonEsignModalComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ESignFlowService, useValue: eSignFlow },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonEsignModalComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('prepares eSign through the shared flow service and opens the consent modal only after success', () => {
    eSignFlow.start.and.returnValue(of({
      context: { id: 'C_ID', status: 'OB', formRemarks: 'Verified' },
      message: 'Please review the documents.',
      documents: [{ docName: 'Form PDF', docUrl: 'form.pdf' }],
    }));

    component.tempFormObj = { id: 'C_ID', status: 'OB', formRemarks: 'Verified' };
    component.ngOnChanges({
      tempFormObj: {
        currentValue: component.tempFormObj,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(eSignFlow.start).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 'C_ID',
      status: 'OB',
      formRemarks: 'Verified',
    }));
    expect(component.prepareMessage).toBe('Please review the documents.');
    expect(component.documentList.length).toBe(1);
    expect(modalSpy).toHaveBeenCalledWith('show');
  });

  it('shows an error and does not open consent modal when prepare fails', () => {
    eSignFlow.start.and.returnValue(of(null));

    component.tempFormObj = { id: 'C_ID', status: 'OB' };
    component.ngOnChanges({
      tempFormObj: {
        currentValue: component.tempFormObj,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(eSignFlow.start).toHaveBeenCalledWith(component.tempFormObj);
    expect(modalSpy).not.toHaveBeenCalledWith('show');
  });

  it('does not perform eSign until user consent is checked', () => {
    component.tempFormObj = { id: 'C_ID', status: 'OB' };
    component.performESign();

    expect(eSignFlow.perform).not.toHaveBeenCalled();
  });

  it('performs eSign with prepared documents through the shared flow service', () => {
    eSignFlow.perform.and.returnValue(of(true));
    component.tempFormObj = { id: 'C_ID', status: 'OB', formRemarks: 'Verified' };
    component.documentList = [{ docName: 'Form PDF', docUrl: 'form.pdf' }];
    component.isAgree = true;
    component.performESign();

    expect(eSignFlow.perform).toHaveBeenCalledWith(component.tempFormObj, component.documentList);
    expect(modalSpy).toHaveBeenCalledWith('hide');
  });

  it('shows an error and stays on page when perform eSign fails', () => {
    eSignFlow.perform.and.returnValue(of(false));

    component.tempFormObj = { id: 'C_ID', status: 'OB' };
    component.isAgree = true;
    component.performESign();

    expect(eSignFlow.perform).toHaveBeenCalledWith(component.tempFormObj, []);
    expect(modalSpy).not.toHaveBeenCalledWith('hide');
  });
});

