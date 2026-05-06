import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appNoEmoji]',
    standalone: false
})
export class NoEmojiDirective {
  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    const sanitizedInput = input.replace(
      /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F1E0}-\u{1F1FF}]/gu,
      ''
    );
    this.control.control?.setValue(sanitizedInput);
  }
}
