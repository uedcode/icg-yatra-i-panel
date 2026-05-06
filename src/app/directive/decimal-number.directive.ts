import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[appDecimalNumber]',
    standalone: false
})
export class DecimalNumberDirective {

    private regex: RegExp = new RegExp(/^\d*\.?\d{0,4}$/g);
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', 'Enter'];
    constructor(private el: ElementRef, private ngmodel: NgModel) { }

    @Input() maxNumber = 8;
    @HostListener('input', ['$event']) onInputChange(event) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const current: string = this.el.nativeElement.value;

        if (!String(current).match(this.regex)) {
            this.el.nativeElement.value = current.slice(0, -1);
            this.ngmodel.update.emit(this.el.nativeElement.value);
            event.stopPropagation();
        }

        if (current.length > this.maxNumber && !current.includes(".")) {
            this.el.nativeElement.value = current.slice(0, -1);
            this.ngmodel.update.emit(this.el.nativeElement.value);
            event.stopPropagation();
        }
    }

    @HostListener('paste', ['$event']) onPaste(event) {
        event.preventDefault();
    }
}