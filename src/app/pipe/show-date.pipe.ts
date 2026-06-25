import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { legacyDate } from '../shared/utils/legacy-display.util';

@Pipe({
    name: 'showDate',
    standalone: false
})
export class ShowDatePipe implements PipeTransform {

  transform(value: any, format: string): any {
    if (value !== null && value !== undefined && value !== '' && value != "null" && value != "undefined") {
      const datePipe = new DatePipe('en-US');
      switch (format) {
        case 'mediumDate':
        case 'queueDate':
          return legacyDate(value, 'queueDate');
        case 'formDate':
          return legacyDate(value, 'formDate');
        case 'voucherDate':
          return legacyDate(value, 'voucherDate');
        case 'dateTime':
          return legacyDate(value, 'dateTime');
        case 'dateTimeSeconds':
          return legacyDate(value, 'dateTimeSeconds');
        case 'short':
          return datePipe.transform(value, 'dd-MMM-yyyy');
        case 'medium':
          return legacyDate(value, 'dateTime');
        case 'full':
          return legacyDate(value, 'dateTimeSeconds');
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

