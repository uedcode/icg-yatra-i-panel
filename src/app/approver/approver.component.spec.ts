import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverComponent } from './approver.component';

describe('ApproverComponent', () => {
  let component: ApproverComponent;
  let fixture: ComponentFixture<ApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run ngOnInit without side effects', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should render approver shell text', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(text).toContain('approver works!');
  });
});
