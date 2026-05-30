import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'yesNo',
    standalone: false
})
export class YesNoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value == 0) {
      return "No";
    } else if (value == 1) {
      return "Yes"
    } else {
      return "-";
    }
  }
}

