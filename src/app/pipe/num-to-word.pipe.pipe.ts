import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numToWord',
    standalone: false
})
export class NumToWordPipe implements PipeTransform {
  private words = [
    'Zero','One','Two','Three','Four',
    'Five','Six','Seven','Eight','Nine'
  ];

  transform(value: number): string {
    const idx = Math.floor(+value);
    return this.words[idx] ?? '';
  }
}

