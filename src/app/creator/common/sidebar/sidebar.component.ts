import { AuthService } from 'src/app/service/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { ClaimService } from 'src/app/service/claim.service';

declare var $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit {
  submenuShow: boolean = false;
  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    private $claim: ClaimService
  ) {}

  userIdDetails;
  codeRoleList;
  config;
  countObj: any = {};

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
    this.getCount();
    this.sidebarDropdown();
  }
  
  getCount() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          desigId:this.userIdDetails?.desigId
        },
      };
      if (this.userIdDetails?.roleTypeId != this.codeRoleList?.creator) {
        this.config.headers.unitId =  this.$auth.getUserDetails()?.unitId;
      }
      if (this.userIdDetails?.roleTypeId) {
        this.config.headers.roleTypeId = this.userIdDetails?.roleTypeId;
      }
      if (this.userIdDetails?.roleTypeId == this.codeRoleList?.creator) {
        this.config.headers.userId = this.userIdDetails?.userId;
      }
      this.$claim.getStatusCount(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.countObj = response.object;
          }
        },
        (err) => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
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
