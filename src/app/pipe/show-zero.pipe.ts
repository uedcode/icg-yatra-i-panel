import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'showZero',
    standalone: false
})
export class ShowZeroPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined") {
      if (value % 1 != 0) {
        value = parseFloat(value.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
      }
      return value;
    } else {
      if (args) {
        return args;
      } else {
        return "0";
      }
    }
  }
  
}

