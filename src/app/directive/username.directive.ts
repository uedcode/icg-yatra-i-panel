import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[appUsername]',
    host: {
        '(input)': '$event'
    },
    standalone: false
})
export class UsernameDirective {

  lastValue: string;
    private VALID_REGEX = /[^0-9a-zA-Z._-]/gi;
    

    constructor(public ref: ElementRef) { }
    formatInput(input) {
        return input.replace(this.VALID_REGEX, '');
    }


    @HostListener('input', ['$event']) onInput($event) {
        
        var start = $event.target.selectionStart;
        var end = $event.target.selectionEnd;
        $event.target.value = this.formatInput($event.target.value)
        $event.target.setSelectionRange(start, end);
        $event.preventDefault();

        if (!this.lastValue || (this.lastValue && $event.target.value.length > 0 && this.lastValue !== $event.target.value)) {
            this.lastValue = this.ref.nativeElement.value = $event.target.value;
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', false, true);
            event.target.dispatchEvent(evt);
        }
    }

}
