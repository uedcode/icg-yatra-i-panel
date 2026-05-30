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
      } else if (value == "IB") {
        return "Inbox";
      } else if (value == "DR") {
        return "Draft";
      } else if (value == "MD") {
        return "Manual Draft";
      } else if (value == "OB") {
        return "Outbox";
      } else if (value == "AP") {
        return "Approved";
      } else if (value == "NA") {
        return "Not Approved";
      } else if (value == "RT") {
        return "Returned";
      } else if (value == "RJ") {
        return "Rejected";
      } else if (value == "PS") {
        return "Passed";
      } else if (value == "NP") {
        return "Not Passed";
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

