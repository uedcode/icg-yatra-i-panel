import { SysAdminExcelImportComponent } from './excel-import.component';

describe('SysAdminExcelImportComponent', () => {
  let component: SysAdminExcelImportComponent;
  let commonService: jasmine.SpyObj<any>;
  let excelImportService: jasmine.SpyObj<any>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj('CommonService', ['showMessage', 'showLoader', 'hideLoader']);
    excelImportService = jasmine.createSpyObj('ExcelImportService', ['importExcel']);
    component = new SysAdminExcelImportComponent(commonService, excelImportService);
  });

  it('should use legacy default Excel headings', () => {
    expect(component.excelObj).toEqual({
      name: 'Name',
      userName: 'User Name',
      employeeId: 'Employee ID',
      esignId: 'E-Sign ID',
      mobileNo: 'Mobile Number',
      emailId: 'Email ID',
      kycId: 'KYC ID',
    });
  });

  it('should map uploaded row headings to backend keys', () => {
    component.excelObj = {
      name: 'Officer Name',
      userName: 'Login',
      employeeId: 'Emp',
      esignId: 'ESign',
      mobileNo: 'Mobile',
      emailId: 'Email',
      kycId: 'KYC',
    };

    const mappedRow = (component as any).mapExcelRow({
      Login: 'vkumar',
      'Officer Name': 'V Kumar',
      Emp: '123',
      ESign: 'ES-1',
      Mobile: '9999999999',
      Email: 'v@example.com',
      KYC: 'KYC-1',
    });

    expect(mappedRow).toEqual({
      userName: 'vkumar',
      name: 'V Kumar',
      employeeId: '123',
      esignId: 'ES-1',
      mobileNo: '9999999999',
      emailId: 'v@example.com',
      kycId: 'KYC-1',
    });
  });

  it('should block upload when no file is selected', () => {
    component.excelFile = null;

    component.uploadExcelFile();

    expect(commonService.showMessage).toHaveBeenCalledWith('Please choose Excel file.', 'danger');
    expect(excelImportService.importExcel).not.toHaveBeenCalled();
    expect(commonService.showLoader).not.toHaveBeenCalled();
  });
});
