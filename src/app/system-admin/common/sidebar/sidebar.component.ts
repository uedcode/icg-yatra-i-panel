import { AuthService } from 'src/app/service/auth/auth.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
    selector: 'app-system-admin-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  private statusCountRefreshSub?: Subscription;

  constructor(public $auth: AuthService, private $claimStateApi: ClaimStateApiService) { }

  ngOnInit(): void {
    
    this.userIdDetails = this.$auth.getUserDetails();
    this.codeRoleList = this.$auth.codeRoleType();
    this.statusCountRefreshSub = this.$claimStateApi.statusCountRefresh$.subscribe(() => {
      this.getStateCount();
    });
    this.getStateCount();
  }
  ngAfterViewInit(): void {
    this.sidebarDropdown();
  }

  ngOnDestroy(): void {
    $(document).off('click.systemAdminSidebar', "[data-toggle='slide']");
    this.statusCountRefreshSub?.unsubscribe();
  }

  userIdDetails;
  codeRoleList;
  stateCount: any = {};

  getStateCount() {
    const config = {
      headers: {
        Accept: 'application/json;odata=verbose',
        userId: this.userIdDetails?.userId,
        roleTypeId: this.userIdDetails?.roleTypeId,
      }
    };
    this.$claimStateApi.getStatusCount(config).subscribe(
      (response: any) => {
        if (response.status) {
          this.stateCount = response.object?.[0] || {};
        }
      },
      () => {
        this.stateCount = this.stateCount || {};
      }
    );
  }

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


