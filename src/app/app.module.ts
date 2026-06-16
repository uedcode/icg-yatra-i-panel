import { HeaderInterceptor } from './HeaderInterceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './pages/login/login.component';
import { NgxPaginationModule } from 'ngx-pagination';

import { AuthGuard } from './auth.guard';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { INgxSelectOptions, NgxSelectModule } from 'ngx-select-ex';

import { FileExcelService } from 'src/app/service/form/file-excel.service';

import { OrderModule } from 'ngx-order-pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { DirectiveModule } from './app-directive.module';
import { PipeModule } from './app-pipe.module';
import { ComponentModule } from './app-component.module';
import { VerifyOtpModalComponent } from './pages/verify-otp-modal/verify-otp-modal.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ForgotPasswordModalComponent } from './modals/forgot-password-modal/forgot-password-modal.component';
import { RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from "ng-recaptcha";
import { environment } from 'src/environments/environment';
import { VerifyTotpModalComponent } from './pages/verify-totp-modal/verify-totp-modal.component';
import { PublicFaqComponent } from './pages/public-faq/public-faq.component';
import { PublicVersionHistoryComponent } from './pages/public-version-history/public-version-history.component';
import { PublicPreviewUpdatePnoComponent } from './pages/public-preview-update-pno/public-preview-update-pno.component';
import { PublicSupportComponent } from './pages/public-support/public-support.component';
import { PublicParamvtComponent } from './pages/public-paramvt/public-paramvt.component';
import { PublicTestRedirectComponent } from './pages/public-test-redirect/public-test-redirect.component';


const CustomSelectOptions: INgxSelectOptions = { // Check the interface for more options
    optionValueField: 'id',
    optionTextField: 'name',
    keepSelectedItems: false
};

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        VerifyOtpModalComponent,
        VerifyTotpModalComponent,
        ForgotPasswordModalComponent,
        PublicFaqComponent,
        PublicVersionHistoryComponent,
        PublicPreviewUpdatePnoComponent,
        PublicSupportComponent,
        PublicParamvtComponent,
        PublicTestRedirectComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxPaginationModule,
        NgxSpinnerModule,
        NgxSelectModule.forRoot(CustomSelectOptions),
        NgMultiSelectDropDownModule.forRoot(),
        OrderModule,
        AngularEditorModule,
        ComponentModule,
        DirectiveModule,
        PipeModule,
        NgOtpInputModule,
        RecaptchaModule,
        RecaptchaFormsModule], providers: [
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HeaderInterceptor,
            multi: true,
        },
        [DatePipe],
        [FileExcelService],
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.recaptcha.siteKey,
            } as RecaptchaSettings,
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }

