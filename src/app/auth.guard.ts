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

            if (this.isSharedUtilityRoute(completeUrl)) {
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
      'claim-new'
    ];

    private readonly advanceOnlyTokens = [
      '/new',
      'form-ty-duty',
      'form-tyduty',
      'form-fte-advance',
      'form-fte',
      'form-pmt-duty',
      'form-pmt',
      'form-ltc-advance',
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
        return !this.claimOnlyTokens.some((token) => this.matchesRouteToken(normalized, token));
      }
      if (moduleId === 'CLM') {
        return !this.advanceOnlyTokens.some((token) => this.matchesRouteToken(normalized, token));
      }
      return true;
    }

    private matchesRouteToken(routeUrl: string, token: string): boolean {
      const routePath = String(routeUrl || '').toLowerCase().split('?')[0];
      const normalizedToken = String(token || '').toLowerCase();
      const cleanToken = normalizedToken.replace(/^\/+|\/+$/g, '');
      const segments = routePath.split('/').filter(Boolean);

      if (!cleanToken) {
        return false;
      }
      if (normalizedToken === '-claim') {
        return segments.some((segment) => segment.includes('-claim'));
      }
      if (cleanToken.endsWith('-')) {
        return segments.some((segment) => segment.startsWith(cleanToken));
      }
      return segments.includes(cleanToken);
    }

    private isSharedUtilityRoute(routeUrl: string): boolean {
      const normalized = String(routeUrl || '').toLowerCase();
      return normalized === '/view-file' ||
        normalized.startsWith('/view-file/') ||
        normalized === '/common-profile-setting';
    }

}

