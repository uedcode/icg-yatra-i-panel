import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';

@Component({
    selector: 'app-view-user-modal',
    templateUrl: './view-user-modal.component.html',
    styleUrls: ['./view-user-modal.component.css'],
    standalone: false
})
export class ViewUserModalComponent implements OnInit {

  constructor(public $auth: AuthService) { }

  userIdDetails;
  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
  }

  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }
}
