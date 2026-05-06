import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'showDate',
    standalone: false
})
export class ShowDatePipe implements PipeTransform {

  transform(value: any, format: string): any {
    if (value && value != "null" && value != "undefined" && value != 0) {
      const datePipe = new DatePipe('en-US');
      switch (format) {
        case 'short':
          return datePipe.transform(value, 'dd-MMM-yyyy');
        case 'medium':
          return datePipe.transform(value, 'dd-MMM-yyyy hh:mm a'); // Include time in medium format
        case 'full':
          return datePipe.transform(value, 'dd-MMM-yyyy hh:mm:ss a'); // Full date and time
        case 'datetime':
          return datePipe.transform(value, 'yyyy-MM-dd HH:mm'); // ISO datetime format
        default:
          return datePipe.transform(value, format); // Use provided format
      }
    } else {
      return "-";
    }
  }
  
}
