import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { CommonDialogService, CommonDialogState } from 'src/app/service/core/common-dialog.service';
import { CommonDialogHostComponent } from './common-dialog-host.component';

describe('CommonDialogHostComponent', () => {
  let component: CommonDialogHostComponent;
  let fixture: ComponentFixture<CommonDialogHostComponent>;
  let state$: BehaviorSubject<CommonDialogState | null>;
  let dialogService: jasmine.SpyObj<CommonDialogService>;

  beforeEach(async () => {
    state$ = new BehaviorSubject<CommonDialogState | null>(null);
    dialogService = jasmine.createSpyObj('CommonDialogService', ['resolve'], {
      state$: state$.asObservable(),
    });

    await TestBed.configureTestingModule({
      declarations: [CommonDialogHostComponent],
      providers: [{ provide: CommonDialogService, useValue: dialogService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonDialogHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the active dialog', () => {
    state$.next({
      mode: 'message',
      title: 'Alert',
      message: 'Only PDF allowed.',
      okText: 'OK',
      type: 'danger',
    });
    fixture.detectChanges();

    expect(component.dialog?.message).toBe('Only PDF allowed.');
    expect(fixture.nativeElement.textContent).toContain('Only PDF allowed.');
  });

  it('delegates confirm and cancel', () => {
    component.confirm();
    component.cancel();

    expect(dialogService.resolve).toHaveBeenCalledWith(true);
    expect(dialogService.resolve).toHaveBeenCalledWith(false);
  });
});
