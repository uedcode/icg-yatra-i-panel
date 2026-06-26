import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-delete-modal',
    templateUrl: './delete-modal.component.html',
    styleUrls: ['./delete-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DeleteModalComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
        
    }
    @Input() deleteData;
    @Output() deleteConfirmed=new EventEmitter();

    deleteConfirm(){  
      
      this.deleteConfirmed.emit(this.deleteData);
    }
}
