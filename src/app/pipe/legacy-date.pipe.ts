import { Pipe, PipeTransform } from '@angular/core';
import { legacyDate } from '../shared/utils/legacy-display.util';

@Pipe({
  name: 'legacyDate',
  standalone: false,
})
export class LegacyDatePipe implements PipeTransform {
  transform(value: unknown, format = 'dd-MMM-yyyy', fallback = '-'): string {
    return legacyDate(value, format, fallback);
  }
}
