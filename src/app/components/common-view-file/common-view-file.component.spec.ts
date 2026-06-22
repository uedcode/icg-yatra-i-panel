import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonViewFileComponent } from './common-view-file.component';

describe('CommonViewFileComponent', () => {
  let component: CommonViewFileComponent;
  let fixture: ComponentFixture<CommonViewFileComponent>;
  let routeStub: { snapshot: { params: { id: string } } };

  beforeEach(() => {
    routeStub = {
      snapshot: {
        params: {
          id: btoa('http://localhost:8084/yatra-i/data/file.pdf?t=1'),
        },
      },
    };

    return TestBed.configureTestingModule({
      declarations: [CommonViewFileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonViewFileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should decode pdf route param into doc viewer URL', () => {
    component.ngOnInit();

    expect(component.docUrl).toBe('http://localhost:8084/yatra-i/data/file.pdf?t=1');
    expect(component.imgUrl).toBeUndefined();
  });

  it('should decode image route param into image URL', () => {
    routeStub.snapshot.params.id = btoa('http://localhost:8084/yatra-i/data/file.png?t=1');

    component.ngOnInit();

    expect(component.imgUrl).toBe('http://localhost:8084/yatra-i/data/file.png?t=1');
    expect(component.docUrl).toBeUndefined();
  });
});

