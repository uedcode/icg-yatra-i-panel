import { AuthService } from 'src/app/service/auth/auth.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-system-admin-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(public $auth: AuthService) { }

  ngOnInit(): void {
    
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
  }
  ngAfterViewInit(): void {
    this.sidebarDropdown();
  }

  ngOnDestroy(): void {
    $(document).off('click.systemAdminSidebar', "[data-toggle='slide']");
  }

  userIdDetails;
  codeRoleList;

  sidebarDropdown() {
    $(document).off('click.systemAdminSidebar', "[data-toggle='slide']");
    $(document).on('click.systemAdminSidebar', "[data-toggle='slide']", function (event) {
      event.preventDefault();
      const slideMenu = $('.side-menu');
      if (!$(this).parent().hasClass('is-expanded')) {
        slideMenu.find("[data-toggle='slide']").parent().removeClass('is-expanded');
      }
      $(this).parent().toggleClass('is-expanded');
    });
  }
  openUserManualModal() {
    $("#user_manual_modal").modal('show');
  }
}

