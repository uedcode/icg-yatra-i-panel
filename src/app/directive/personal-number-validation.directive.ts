import { Directive, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[appPersonalNumberValidation]',
    standalone: false
})
export class PersonalNumberValidationDirective {

  constructor(
    private ngModel: NgModel
  ) { }

  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value;

    // This regex allows only numbers, one hyphen, and a single letter after the hyphen
    const validInput = input.match(/^[0-9]+-?[A-Za-z]?/)?.[0] || input.match(/^[0-9]+/)?.[0] || '';

    if (input !== validInput) {
      this.ngModel.control?.setValue(validInput); // Set the modified valid input
    }
  }
}

