import { Pipe, PipeTransform } from '@angular/core';
import { legacyValue } from '../shared/utils/legacy-display.util';

@Pipe({
  name: 'legacyValue',
  standalone: false,
})
export class LegacyValuePipe implements PipeTransform {
  transform(value: unknown, fallback = '-'): string {
    return legacyValue(value, fallback);
  }
}
