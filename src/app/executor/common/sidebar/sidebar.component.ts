import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-executor-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SidebarComponent implements OnInit {
  userIdDetails: any;

  constructor(public $auth: AuthService) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
  }
}
