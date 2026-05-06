import { Directive, Input, forwardRef, HostListener } from '@angular/core'
import { NG_VALIDATORS, Validator, AbstractControl, Validators } from '@angular/forms'

@Directive({
    selector: '[maxValue]',
    providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxValueDirective), multi: true }],
    standalone: false
})
export class MaxValueDirective {

    @Input() maxValue: number;
    @Input() form: any;
    @Input() controller: any;

    validate(control: AbstractControl): { [key: string]: any } {
        return Validators.max(this.maxValue)(control)
    }

    @HostListener('blur', ['$event']) onInput($event) {
        this.form.form.controls[this.controller.name].updateValueAndValidity()
    }

}