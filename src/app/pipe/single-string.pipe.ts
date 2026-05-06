import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'singleString',
    standalone: false
})
export class SingleStringPipe implements PipeTransform {

    transform(value: any, key?: any): any {
        let filteredArr = [];
        value.map(elem => {
            filteredArr.push(elem[key])
        })
        return filteredArr.toString();
    }

}
