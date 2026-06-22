import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { CommonDialogService } from './common-dialog.service';

describe('CommonDialogService', () => {
  let service: CommonDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonDialogService);
  });

  it('resolves confirm true when accepted', async () => {
    const result = service.confirm({ message: 'Delete row?' });
    let state: any;
    service.state$.pipe(take(1)).subscribe((dialog) => (state = dialog));

    expect(state.mode).toBe('confirm');
    expect(state.message).toBe('Delete row?');

    service.resolve(true);
    await expectAsync(result).toBeResolvedTo(true);
  });

  it('resolves confirm false when cancelled', async () => {
    const result = service.confirm({ message: 'Delete row?' });

    service.resolve(false);

    await expectAsync(result).toBeResolvedTo(false);
  });

  it('queues consecutive dialogs', async () => {
    const first = service.confirm({ message: 'First' });
    const second = service.message({ message: 'Second' });
    const seen: string[] = [];
    const sub = service.state$.subscribe((dialog) => {
      if (dialog) {
        seen.push(dialog.message);
      }
    });

    service.resolve(true);
    service.resolve(true);

    await expectAsync(first).toBeResolvedTo(true);
    await expectAsync(second).toBeResolved();
    expect(seen).toEqual(['First', 'Second']);
    sub.unsubscribe();
  });
});
