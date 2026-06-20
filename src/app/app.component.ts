import { Component } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { AuthService } from 'src/app/service/auth/auth.service';
import { environment } from 'src/environments/environment';
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

	constructor(
	  public $auth: AuthService,
	  private router: Router,
	  private activatedRoute: ActivatedRoute,
	  private titleService: Title
	) { }

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
		this.storedTheme = "theme_government";
	}

}

