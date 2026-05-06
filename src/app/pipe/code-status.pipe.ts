import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'codeStatus',
    standalone: false
})
export class CodeStatusPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined") {
      if (value == "PE") {
        return "Pending";
      } else if (value == "AP") {
        return "Approved";
      } else if (value == "RJ") {
        return "Rejected";
      } else if (value == "AC") {
        return "Enabled";
      } else if (value == "DA") {
        return "Disabled";
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
