import { AuthService } from 'src/app/service/auth.service';
import { Component, OnInit } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit {
  submenuShow: boolean = false;
  constructor(public $auth: AuthService) {}

  userIdDetails;
  codeRoleList;

  ngOnInit(): void {
    
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
    this.sidebarDropdown();
  }

  sidebarDropdown() {
    var slideMenu = $('.side-menu');
    $("[data-toggle='slide']").on('click', function (event) {
      event.preventDefault();
      if (!$(this).parent().hasClass('is-expanded')) {
        slideMenu
          .find("[data-toggle='slide']")
          .parent()
          .removeClass('is-expanded');
      }
      $(this).parent().toggleClass('is-expanded');
    });
  }
  showHideSubMenu() {
    this.submenuShow = !this.submenuShow;
  }
  openUserManualModal() {
    $("#user_manual_modal").modal('show');
  }
}
