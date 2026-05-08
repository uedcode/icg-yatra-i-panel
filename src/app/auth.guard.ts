import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthGuard  {

    constructor(private router: Router, public $auth: AuthService) { }
    dashboardObj: any;
    private readonly storageKeys = environment.authConfig.storageKeys;
    private readonly legacyAccessTokenKey = 'pilotageAccessToken';

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        var returnVal = false;
        const hasToken = !!(
            localStorage.getItem(this.storageKeys.accessToken) ||
            localStorage.getItem(this.legacyAccessTokenKey)
        );
        if (hasToken) {
              // var userIdDetails = this.$auth.getUserDetails();
            // var codeGroupType = this.$auth.codeGroupType();
            // var groupTypeId = userIdDetails.groupTypeId;
            var localUrl = route.routeConfig.path;
            let isPresent = [];

            isPresent = this.commonPageList.filter(elem => localUrl.includes(elem.path));
            if (isPresent.length > 0) {
                returnVal = true;
            } 

            var completeUrl = state.url;
            let moduleName = this.$auth.getModuleName();
            if(completeUrl.includes(moduleName)){
                returnVal = true;
            }

            let list = ['/view-file', '/switch-module', '/new-device', '/common-profile-setting', '/common-new-device'];
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

}
