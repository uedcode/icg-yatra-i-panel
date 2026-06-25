import { Pipe, PipeTransform } from '@angular/core';
import { legacyShowZero } from '../shared/utils/legacy-display.util';

@Pipe({
  name: 'legacyZero',
  standalone: false,
})
export class LegacyZeroPipe implements PipeTransform {
  transform(value: unknown): string {
    return legacyShowZero(value);
  }
}
