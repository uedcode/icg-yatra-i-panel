import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-launcher',
  templateUrl: './settings-launcher.component.html',
  styleUrls: ['./settings-launcher.component.scss'],
  standalone: false
})
export class SettingsLauncherComponent {
  settingsCards = [
    {
      title: 'Pay level entitlements',
      route: '../manage-pay-level',
      icon: 'fa fa-money',
    },
    {
      title: 'FAQ update',
      route: '../manage-faq',
      icon: 'fa fa-question-circle',
    },
    {
      title: 'Version history update',
      route: '../manage-version',
      icon: 'fa fa-history',
    },
    {
      title: 'Document update',
      route: '../manage-doc',
      icon: 'fa fa-file',
    },
    {
      title: 'Port Rate update',
      route: '../manage-port-rate',
      icon: 'fa fa-ship',
    },
    {
      title: 'Initial Message',
      route: '../manage-message',
      icon: 'fa fa-comments',
    },
    {
      title: 'Business Rule',
      route: '../manage-business-rule',
      icon: 'fa fa-gavel',
    },
    {
      title: 'Reason',
      route: '../manage-reason',
      icon: 'fa fa-commenting',
    },
    {
      title: 'TY Duty Purpose',
      route: '../manage-ty-duty-purpose',
      icon: 'fa fa-flag',
    },
  ];
}
