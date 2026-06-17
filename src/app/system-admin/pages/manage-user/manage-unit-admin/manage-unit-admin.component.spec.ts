import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

import { ManageUnitAdminComponent } from './manage-unit-admin.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { SystemAdminService } from 'src/app/service/admin/systemAdmin.service';
import { UserService } from 'src/app/service/admin/user.service';

@Pipe({ name: 'filterComplex', standalone: false })
class FilterComplexPipeMock implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

@Pipe({ name: 'orderBy', standalone: false })
class OrderByPipeMock implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

@Pipe({ name: 'paginate', standalone: false })
class PaginatePipeMock implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

@Pipe({ name: 'showHypen', standalone: false })
class ShowHypenPipeMock implements PipeTransform {
  transform(value: any): any {
    return value || '-';
  }
}

@Pipe({ name: 'showDate', standalone: false })
class ShowDatePipeMock implements PipeTransform {
  transform(value: any): any {
    return value || '-';
  }
}

describe('ManageUnitAdminComponent', () => {
  let component: ManageUnitAdminComponent;
  let fixture: ComponentFixture<ManageUnitAdminComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let systemAdminService: jasmine.SpyObj<SystemAdminService>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'codeRoleType',
      'codeStatus',
      'getUserDetails',
      'viewFile'
    ]);
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'showLoader',
      'hideLoader',
      'showMessage'
    ]);
    systemAdminService = jasmine.createSpyObj<SystemAdminService>('SystemAdminService', [
      'getGxUnits',
      'getAll',
      'createOrUpdate',
      'changeStatus'
    ]);
    userService = jasmine.createSpyObj<UserService>('UserService', [
      'getAll',
      'getSingle'
    ]);

    authService.codeRoleType.and.returnValue({ unitAdmin: 'UN' } as any);
    authService.codeStatus.and.returnValue({ activate: 'AC', deactivate: 'DA' } as any);
    authService.getUserDetails.and.returnValue({ userId: 'SYS1' } as any);
    systemAdminService.getGxUnits.and.returnValue(of({ status: true, object: [{ unit: '000226', descr: 'ICGS Delhi' }] }));
    systemAdminService.getAll.and.returnValue(of({ status: true, object: [] }));
    systemAdminService.createOrUpdate.and.returnValue(of({ status: true, message: 'Saved', object: [] }));
    systemAdminService.changeStatus.and.returnValue(of({ status: true, message: 'Updated' }));
    userService.getAll.and.returnValue(of({ status: true, object: [] }));
    userService.getSingle.and.returnValue(of({ status: true, object: [] }));

    return TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        ManageUnitAdminComponent,
        FilterComplexPipeMock,
        OrderByPipeMock,
        PaginatePipeMock,
        ShowHypenPipeMock,
        ShowDatePipeMock
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CommonService, useValue: commonService },
        { provide: SystemAdminService, useValue: systemAdminService },
        { provide: UserService, useValue: userService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUnitAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads GX units and Unit Admin roles with legacy headers on init', () => {
    expect(systemAdminService.getGxUnits).toHaveBeenCalled();
    expect(systemAdminService.getAll).toHaveBeenCalledWith({
      headers: {
        userId: '',
        roleTypeId: 'UN',
        unitId: '',
        statusId: '',
        verAppIndicator: '0',
        isArchive: '0'
      }
    });
  });

  it('loads users by selected unit and cadre', () => {
    component.formObj.unit = '000226';
    component.formObj.cadre = 'OP';
    component.onCadreChange();

    expect(userService.getAll).toHaveBeenCalledWith({
      headers: {
        unitId: '000226',
        cadre: 'OP'
      }
    });
  });

  it('loads selected user details and fills display object', () => {
    userService.getSingle.and.returnValue(of({
      status: true,
      object: [{ userId: '08UD', name: 'Test User', pno: '0435-M', phone: '9999999999', rank: 'Commandant' }]
    }));

    component.onUserChange('08UD');

    expect(userService.getSingle).toHaveBeenCalledWith({ headers: { userId: '08UD' } });
    expect(component.getUserPno(component.userObj)).toBe('0435-M');
    expect(component.getUserPhone(component.userObj)).toBe('9999999999');
    expect(component.getUserRank(component.userObj)).toBe('Commandant');
  });

  it('builds multipart payload without invalid top-level display fields', () => {
    component.formObj = {
      unit: '000226',
      cadre: 'OP',
      userId: '08UD',
      authNo: 'AUTH-1',
      authDate: '2026-06-17',
      fromDateTime: '2026-06-17T10:30'
    };
    component.authDocFile = new File(['pdf'], 'auth.pdf', { type: 'application/pdf' });
    systemAdminService.createOrUpdate.calls.reset();

    component.saveRecord();

    const formData = systemAdminService.createOrUpdate.calls.mostRecent().args[0] as FormData;
    const rolePayload = JSON.parse(formData.get('aclRoleDTO') as string);
    expect(formData.get('authDocUrl')).toEqual(component.authDocFile);
    expect(rolePayload.aclCodeRoleTypeDTO.roleTypeId).toBe('UN');
    expect(rolePayload.aclCodeStatusDTO.statusId).toBe('AC');
    expect(rolePayload.aclUserDTO).toEqual({ userId: '08UD', cadre: 'OP' });
    expect(rolePayload.codeUnitDTO.unit).toBe('000226');
    expect(rolePayload.roleName).toBe('Unit Admin');
    expect(rolePayload.name).toBeUndefined();
    expect(rolePayload.rank).toBeUndefined();
    expect(rolePayload.pno).toBeUndefined();
  });

  it('blocks duplicate Unit Admin user', () => {
    component.formObj = {
      unit: '000226',
      cadre: 'OP',
      userId: '08UD',
      authNo: 'AUTH-1',
      authDate: '2026-06-17',
      fromDateTime: '2026-06-17T10:30'
    };
    component.authDocFile = new File(['pdf'], 'auth.pdf', { type: 'application/pdf' });
    component.dataList = [{ aclUserDTO: { userId: '08UD' } }];
    systemAdminService.createOrUpdate.calls.reset();

    component.saveRecord();

    expect(commonService.showMessage).toHaveBeenCalledWith('User already exist as Unit Admin', 'danger');
    expect(systemAdminService.createOrUpdate).not.toHaveBeenCalled();
  });

  it('calls role changeStatus with roleId and target status', () => {
    component.changeStatus({
      roleId: 'R1',
      currentStatus: 'DA',
      aclCodeStatusDTO: { statusId: 'AC' }
    });

    expect(systemAdminService.changeStatus).toHaveBeenCalledWith({
      headers: {
        roleId: 'R1',
        statusId: 'DA'
      }
    });
  });

  it('renders legacy table columns and empty text', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('S.No.');
    expect(text).toContain('Unit');
    expect(text).toContain('Name');
    expect(text).toContain('PNO');
    expect(text).toContain('Phone');
    expect(text).toContain('Rank');
    expect(text).toContain('Authorization No');
    expect(text).toContain('Authorization Date');
    expect(text).toContain('Scanned copy of Authorization');
    expect(text).toContain('From Date and Time');
    expect(text).toContain('No Records');
  });
});
