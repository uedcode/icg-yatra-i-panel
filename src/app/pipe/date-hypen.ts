import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateHypen',
    standalone: false
})
export class DateHypenPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined" && value !== 0) {
      return value;
    } else {
      if (args) {
        return args;
      } else {
        return "-";
      }
    }

  }
}

