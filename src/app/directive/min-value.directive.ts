import { Directive, Input, forwardRef, HostListener } from '@angular/core'
import { NG_VALIDATORS, Validator, AbstractControl, Validators } from '@angular/forms'

@Directive({
    selector: '[minValue]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MinValueDirective, multi: true }],
    standalone: false
})
export class MinValueDirective {


    @Input() minValue: number;
    @Input() form: any;
    @Input() controller: any;

    validate(control: AbstractControl): { [key: string]: any } {
        return Validators.min(this.minValue)(control)
    }

    @HostListener('blur', ['$event']) onInput($event) {
        this.form.form.controls[this.controller.name].updateValueAndValidity()
    }

}
