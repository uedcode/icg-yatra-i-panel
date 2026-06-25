import { Pipe, PipeTransform } from '@angular/core';
import { legacyShowNil } from '../shared/utils/legacy-display.util';

@Pipe({
  name: 'legacyNil',
  standalone: false,
})
export class LegacyNilPipe implements PipeTransform {
  transform(value: unknown): string {
    return legacyShowNil(value);
  }
}
