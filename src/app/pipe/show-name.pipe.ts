import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'showName',
    standalone: false
})
export class ShowNamePipe implements PipeTransform {

    transform(value: any, key?: any, argsArr?: any, primaryKey?: any): any {
        if (!argsArr) return;
        let primKey = primaryKey ? primaryKey : 'id';
        let object = argsArr.find(elem => elem[primKey] == value);
        if (object)
            return object[key];
        return '-';
    }
}
