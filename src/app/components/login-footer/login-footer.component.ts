import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login-footer',
    templateUrl: './login-footer.component.html',
    styleUrls: ['./login-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LoginFooterComponent implements OnInit {

  constructor() { }

  buildNo = environment.appConfig.buildNo;
  ngOnInit() {
  }

}
