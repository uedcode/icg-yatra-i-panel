import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'codeMappingType',
    standalone: false
})
export class CodeMappingTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && value != "null" && value != "undefined") {
      if (value == "ST") {
        return "Station HQ";
      } else if (value == "DHQ") {
        return "DHQ";
      } else if (value == "RHQ") {
        return "RHQ";
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
