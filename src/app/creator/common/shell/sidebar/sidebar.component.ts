import { AuthService } from 'src/app/service/auth/auth.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { Subscription } from 'rxjs';
import { buildLegacyStateCountHeaders } from 'src/app/shared/utils/legacy-api.util';

declare var $: any;

@Component({
    selector: 'app-creator-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  submenuShow: boolean = false;
  private statusCountRefreshSub?: Subscription;
  constructor(
    public $auth: AuthService,
    private $common: CommonService,
    private $claimStateApi: ClaimStateApiService
  ) {}

  userIdDetails;
  codeRoleList;
  config;
  countObj: any = {};

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
    this.statusCountRefreshSub = this.$claimStateApi.statusCountRefresh$.subscribe(() => {
      this.getCount();
    });
    this.getCount();
  }

  ngAfterViewInit(): void {
    this.sidebarDropdown();
  }

  ngOnDestroy(): void {
    $(document).off('click.creatorSidebar', "[data-toggle='slide']");
    this.statusCountRefreshSub?.unsubscribe();
  }
  
  getCount() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: buildLegacyStateCountHeaders(this.userIdDetails, this.codeRoleList),
      };
      this.$claimStateApi.getStatusCount(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.countObj = Array.isArray(response.object) ? response.object[0] || {} : response.object || {};
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
    $(document).off('click.creatorSidebar', "[data-toggle='slide']");
    $(document).on('click.creatorSidebar', "[data-toggle='slide']", function (event) {
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

  get runtimeModuleLabel(): 'Advance' | 'Claim' {
    return this.$auth.isRuntimeClm() ? 'Claim' : 'Advance';
  }
}

