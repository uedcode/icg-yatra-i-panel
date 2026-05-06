import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'codeCadre',
    standalone: false
})
export class CodeCadrePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined") {
      if (value == "OP") {
        return "Officer";
      } else if (value == "EP") {
        return "Sailor";
      } else if (value == "ALL") {
        return "Officer/Sailor";
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
