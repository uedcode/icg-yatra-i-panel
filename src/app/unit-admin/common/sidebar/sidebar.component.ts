import { AuthService } from 'src/app/service/auth/auth.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-unit-admin-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  submenuShow: boolean = false;
  constructor(public $auth: AuthService) {}

  userIdDetails;
  codeRoleList;

  ngOnInit(): void {
    
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
  }
  ngAfterViewInit(): void {
    this.sidebarDropdown();
  }

  ngOnDestroy(): void {
    $(document).off('click.unitAdminSidebar', "[data-toggle='slide']");
  }

  sidebarDropdown() {
    $(document).off('click.unitAdminSidebar', "[data-toggle='slide']");
    $(document).on('click.unitAdminSidebar', "[data-toggle='slide']", function (event) {
      event.preventDefault();
      const slideMenu = $('.side-menu');
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
