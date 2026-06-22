import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { CommonViewFileComponent } from './common-view-file.component';
import { PreviewWindowService } from 'src/app/service/core/preview-window.service';

describe('CommonViewFileComponent', () => {
  let component: CommonViewFileComponent;
  let fixture: ComponentFixture<CommonViewFileComponent>;
  let location: jasmine.SpyObj<Location>;
  let previewWindow: jasmine.SpyObj<PreviewWindowService>;
  let routeStub: {
    snapshot: {
      params: { id: string };
      paramMap: ReturnType<typeof convertToParamMap>;
      queryParamMap: ReturnType<typeof convertToParamMap>;
    };
  };

  const toRouteSafeBase64 = (value: string) =>
    btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  const setRouteId = (id: string) => {
    routeStub.snapshot.params.id = id;
    routeStub.snapshot.paramMap = convertToParamMap({ id });
  };

  beforeEach(() => {
    const id = toRouteSafeBase64('http://localhost:8084/yatra-i/data/file.pdf?t=1');
    routeStub = {
      snapshot: {
        params: {
          id,
        },
        paramMap: convertToParamMap({ id }),
        queryParamMap: convertToParamMap({}),
      },
    };
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    previewWindow = jasmine.createSpyObj<PreviewWindowService>('PreviewWindowService', ['closeOrBack']);

    return TestBed.configureTestingModule({
      declarations: [CommonViewFileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Location, useValue: location },
        { provide: PreviewWindowService, useValue: previewWindow },
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
    setRouteId(toRouteSafeBase64('http://localhost:8084/yatra-i/data/file.png?t=1'));

    component.ngOnInit();

    expect(component.imgUrl).toBe('http://localhost:8084/yatra-i/data/file.png?t=1');
    expect(component.docUrl).toBeUndefined();
  });

  it('should decode legacy btoa route params for copied old viewer URLs', () => {
    setRouteId(btoa('http://localhost:8084/yatra-i/data/legacy-file.pdf?t=1'));

    component.ngOnInit();

    expect(component.docUrl).toBe('http://localhost:8084/yatra-i/data/legacy-file.pdf?t=1');
  });

  it('should decode URL-safe query param fallback when route id is absent', () => {
    const file = toRouteSafeBase64('http://localhost:8084/yatra-i/data/query-file.pdf?t=1');
    setRouteId('');
    routeStub.snapshot.queryParamMap = convertToParamMap({ file });

    component.ngOnInit();

    expect(component.docUrl).toBe('http://localhost:8084/yatra-i/data/query-file.pdf?t=1');
  });

  it('should not render a viewer when file param is missing', () => {
    setRouteId('');

    component.ngOnInit();

    expect(component.url).toBe('');
    expect(component.docUrl).toBeUndefined();
    expect(component.imgUrl).toBeUndefined();
  });

  it('should close the preview tab or fallback back on Back', () => {
    component.goBack();

    expect(previewWindow.closeOrBack).toHaveBeenCalledWith(location);
  });
});

