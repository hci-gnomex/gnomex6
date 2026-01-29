import {ModuleWithProviders, NgModule, Optional, SkipSelf} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";

import {CoolStorageModule} from "angular2-cool-storage";
import {JWT_OPTIONS, JwtHelperService, JwtInterceptor, JwtModule} from "@auth0/angular-jwt";

import {AuthenticationService} from "./authentication.service";
import {RouteGuardService} from "./route-guard.service";
import {AuthenticationComponent} from "./authentication.component";
import {DirectLoginComponent} from "./directlogin.component";
import {TimeoutNotificationComponent} from "./timeout-notification.component";
import {AuthorizationInterceptor} from "./authorization.interceptor";
import {AuthenticationProvider} from "./authentication.provider";
import {ServicesModule} from "../services/services.module";
import {CustomInputModule} from "./custom-input/custom-input.module";

/**
 * Provide a single auth service and interceptor for the implementing application.  Also provide everything
 * from the angular-jwt library.
 *
 * @since 1.0.0
 */
@NgModule({
    imports: [
        CommonModule,
        CustomInputModule,
        HttpClientModule,
        JwtModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        CoolStorageModule,
        ServicesModule,
    ],
    declarations: [
        AuthenticationComponent,
        DirectLoginComponent,
        TimeoutNotificationComponent
    ],
    exports: [
        AuthenticationComponent,
        DirectLoginComponent,
        TimeoutNotificationComponent
    ]
})
export class AuthenticationModule {
    constructor(@Optional() @SkipSelf() parentModule: JwtModule) {
        if (parentModule) {
            throw new Error("AuthenticationModule is already loaded.");
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            providers: [
                AuthenticationProvider,
                JwtHelperService,
                AuthenticationService,
                RouteGuardService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthorizationInterceptor,
                    multi: true
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                },
                {
                    provide: JWT_OPTIONS,
                    useClass: AuthenticationProvider
                }
            ],
            ngModule: AuthenticationModule
        }
    }
}
