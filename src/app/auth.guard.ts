import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { RuntimeModuleId } from './service/auth/runtime-module.service';

@Injectable()
export class AuthGuard  {

    constructor(private router: Router, public $auth: AuthService) { }
    dashboardObj: any;

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        var returnVal = false;
        const hasToken = !!this.$auth.getAccessToken();
        if (hasToken) {
              // var userIdDetails = this.$auth.getUserDetails();
            // var codeGroupType = this.$auth.codeGroupType();
            // var groupTypeId = userIdDetails.groupTypeId;
            var localUrl = route.routeConfig?.path || '';
            let isPresent = [];

            isPresent = this.commonPageList.filter(elem => localUrl.includes(elem.path));
            if (isPresent.length > 0) {
                returnVal = true;
            } 

            const userDetails = this.$auth.getUserDetails();
            const allowedRoles = route.data?.roles as string[] | undefined;
            if (allowedRoles?.length) {
                const currentRole = userDetails?.roleTypeId;
                if (!currentRole || !allowedRoles.includes(currentRole)) {
                    this.$auth.destroySession("2");
                    return false;
                }
            }

            var completeUrl = state.url;
            let moduleName = this.$auth.getModuleName();
            if(moduleName && completeUrl.includes(moduleName)){
                returnVal = true;
            }

            const runtimeModuleId = this.$auth.getRuntimeModuleId();
            if (returnVal && !this.isModuleRouteAllowed(runtimeModuleId, completeUrl)) {
                returnVal = false;
            }

            let list = ['/view-file', '/common-profile-setting'];
            if(list.includes(completeUrl)){
                returnVal = true;
            }
            if (!returnVal) {
                this.$auth.destroySession("2");
            }
            return returnVal;
        }
        else {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/']);
            return false;
        }
    }

    commonPageList : Array<any> = [
        { path: 'login' }, { path: 'dashboard' }, { path: 'profile' }, { path: 'change-password' },
    ];

    private readonly claimOnlyTokens = [
      '/claim/',
      '-claim',
      'movement-update-claim',
      'preview-voucher',
      'form-claim-detail',
      'claim-new'
    ];

    private readonly advanceOnlyTokens = [
      '/new',
      'form-tyduty',
      'form-fte',
      'form-pmt',
      'form-ltc',
      'form-manual-adv',
      'form-ltc-availed-history',
      '/pay-',
      'manual-draft',
      'budget-allocation'
    ];

    private isModuleRouteAllowed(moduleId: RuntimeModuleId, routeUrl: string): boolean {
      const normalized = String(routeUrl || '').toLowerCase();
      if (!normalized) {
        return true;
      }
      if (moduleId === 'ADV') {
        return !this.claimOnlyTokens.some((token) => normalized.includes(token));
      }
      if (moduleId === 'CLM') {
        return !this.advanceOnlyTokens.some((token) => normalized.includes(token));
      }
      return true;
    }

}

