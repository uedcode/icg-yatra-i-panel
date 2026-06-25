import { PreviewWindowService } from './preview-window.service';

describe('PreviewWindowService', () => {
  let service: PreviewWindowService;

  beforeEach(() => {
    service = new PreviewWindowService();
  });

  it('prefixes creator preview URLs with adv runtime path', () => {
    const url = service.buildUrl('/creator', 'preview-ty-duty', { id: 555 }, '/adv/creator/form-ty-duty');

    expect(url).toBe('/adv/creator/preview-ty-duty?id=555');
  });

  it('prefixes creator preview URLs with claim runtime path', () => {
    const url = service.buildUrl(
      '/creator',
      'preview-ty-duty-claim',
      { id: 556, subFormId: 'TYD' },
      '/claim/creator/form-ty-duty-claim'
    );

    expect(url).toBe('/claim/creator/preview-ty-duty-claim?id=556&subFormId=TYD');
  });

  it('does not double-prefix already runtime-scoped URLs', () => {
    const url = service.buildUrl('/adv/creator', 'preview-fte-advance', { id: 777 }, '/adv/creator/form-fte-advance');

    expect(url).toBe('/adv/creator/preview-fte-advance?id=777');
  });

  it('normalizes raw creator preview URLs before opening', () => {
    const url = service.buildUrlFromRaw('/creator/preview-ty-duty?id=555', '/adv/creator/form-ty-duty');

    expect(url).toBe('/adv/creator/preview-ty-duty?id=555');
  });

  it('normalizes raw approver preview URLs in claim runtime', () => {
    const url = service.buildUrlFromRaw('/approver/preview-ty-duty-claim?id=555', '/claim/approver/form-ty-duty-claim');

    expect(url).toBe('/claim/approver/preview-ty-duty-claim?id=555');
  });

  it('skips empty query params and URL-encodes values', () => {
    const url = service.buildUrl('/approver', 'preview-pmt-duty', {
      id: 'C ID 1',
      supId: '',
      note: null,
    }, '/adv/approver/form-pmt-duty');

    expect(url).toBe('/adv/approver/preview-pmt-duty?id=C%20ID%201');
  });
});
