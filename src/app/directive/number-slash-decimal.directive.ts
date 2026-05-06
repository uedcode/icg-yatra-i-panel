import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appNumberSlashDecimal]'
})
export class NumberSlashDecimalDirective {

  constructor(private _el: ElementRef, private ngmodel: NgModel) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;

    // Allow only numbers (0-9), slashes (/), and decimal points (.)
    this._el.nativeElement.value = initalValue.replace(/[^0-9/.]/g, '');

    // Update ngModel value
    if (this.ngmodel) {
      this.ngmodel.update.emit(this._el.nativeElement.value);
    }

    // Stop further event propagation if the input was modified
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
