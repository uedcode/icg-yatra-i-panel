import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transType',
    standalone: false
})
export class TransTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined") {
      if (value == "CR") {
        return "Credit";
      } else if (value == "DE") {
        return "Debit";
      }
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
