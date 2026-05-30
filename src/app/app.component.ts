import { Component } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { AuthService } from 'src/app/service/auth.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {

	tokenPayload;

	constructor(public $auth: AuthService, private $common: CommonService,
        private router: Router, private activatedRoute: ActivatedRoute, private titleService: Title) { }

	ngOnInit() {
		$('[data-toggle="tooltip"]').tooltip();
		this.setFavIcon();
        this.setTitle();

		let _this = this;
		setInterval(() => {
			_this.setDefaultTheme();
		}, 100);

	}

	favIcon: HTMLLinkElement = document.querySelector('#appIcon');
    setFavIcon() {
        this.favIcon.href = environment.appConfig?.favicon;
    }

    setTitle() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let child = this.activatedRoute.firstChild;
                while (child) {
                    if (child.firstChild) {
                        child = child.firstChild;
                    } else if (child.snapshot.data && child.snapshot.data['title']) {
                        return child.snapshot.data['title'];
                    } else {
                        return null;
                    }
                }
                return null;
            })
        ).subscribe((data: any) => {
			window.scrollTo(0, 0)
            this.titleService.setTitle(environment.appConfig?.name);
            if (data) {
                this.titleService.setTitle(data + ' | ' + environment.appConfig?.name);
            }
        });
    }

	storedTheme;
	setDefaultTheme() {
		var userDetails = this.$auth.getUserDetails();
		this.storedTheme = "theme_green";
		// if (userDetails) {
		// 	let groupList = this.$auth.codeGroupType();
		// 	if (userDetails.roleTypeId == groupList.admin) {
		// 		this.storedTheme = "theme_green";
		// 	} else if (userDetails.roleTypeId == groupList.depo) {
		// 		this.storedTheme = "theme_yellow";
		// 	} else if (userDetails.roleTypeId == groupList.subDepo) {
		// 		this.storedTheme = "theme_red";
		// 	} else {
		// 		this.storedTheme = "";
		// 	}
		// }
	}

}

