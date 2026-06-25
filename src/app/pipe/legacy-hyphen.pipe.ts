import { Pipe, PipeTransform } from '@angular/core';
import { legacyShowHyphen } from '../shared/utils/legacy-display.util';

@Pipe({
  name: 'legacyHyphen',
  standalone: false,
})
export class LegacyHyphenPipe implements PipeTransform {
  transform(value: unknown): string {
    return legacyShowHyphen(value);
  }
}
