import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
    selector: 'app-logout-modal',
    templateUrl: './logout-modal.component.html',
    styleUrls: ['./logout-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LogoutModalComponent implements OnInit {

  constructor(private $auth : AuthService) { }

  ngOnInit(): void {   
  }
  logout() {
    this.$auth.destroySession("1");
  }
}
