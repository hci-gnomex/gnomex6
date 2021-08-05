import {GnomexAppComponent} from "./gnomex-app.component";
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HeaderModule} from "./header/header.module";
import {APP_ROUTING} from "./gnomex-app.routes";
import {HttpModule} from "@angular/http";
import {HomeModule} from "./home/home.module";
import {BROWSE_EXPERIMENTS_ENDPOINT} from "./experiments/experiments.service";
import {ExperimentsService} from "./experiments/experiments.service";
import {ExperimentsModule} from "./experiments/experiments.module";
import {ConfigurationModule} from "./configuration/configuration.module";
import {NewBillingAccountModule} from "./billing/new_billing_account/new-billing-account.module";
import {ProgressService} from "./home/progress.service";
import {RouteReuseStrategy, RouterModule} from "@angular/router";
import {TestPageModule} from "./testing/test-page.module";
import {FormsModule} from "@angular/forms";
import {LocalStorageModule, ILocalStorageServiceConfig} from "angular-2-local-storage";

import "./gnomex-app.css";
import "./gnomex-app-color.css";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {ServicesModule } from './services/services.module';
import {AnalysisModule} from "./analysis/analysis.module";
import {DatatracksModule} from "./datatracks/datatracks.module";
import {MatIconModule} from "@angular/material";
import {ReportsModule} from "./reports/reports.module";
import {CookieService} from "angular2-cookie/core";
import {TopicsModule} from "./topics/topics.module";
import {AccountModule} from "./account/account.module";
import {UsersGroupsTablistModule} from "./usersGroups/users-groups-tablist.module";

import {WorkflowModule} from "./workflow/workflow.module";

import {AboutModule} from "./about/about.module";
import {ProductsModule} from "./products/products.module";
import {BillingModule} from "./billing/billing.module";
import {CustomRouteReuseStrategy} from "./custom-route-reuse-strategy";
import {AuthenticationModule} from "./auth/authentication.module";
import {
    AUTHENTICATION_DIRECT_ENDPOINT,
    AUTHENTICATION_LOGOUT_PATH, AUTHENTICATION_MAX_INACTIVITY_MINUTES,
    AUTHENTICATION_ROUTE, AUTHENTICATION_TOKEN_ENDPOINT, AuthenticationService
} from "./auth/authentication.service";
import {AUTHENTICATION_TOKEN_KEY} from "./auth/authentication.provider";
import {UserModule} from "./hci-user/user.module";
import {AUTHENTICATED_USER_ENDPOINT, UserService} from "./hci-user/user.service";
import {AngularSplitModule} from "angular-split";
import {RegisterUserModule} from "./account/register-user/register-user.module";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {ErrorHandlerInterceptor} from "./services/interceptors/error-handler.interceptor";
import {WINDOW_PROVIDERS} from "./services/window.service";
import {MatDialogModule} from "@angular/material";


let localStorageServiceConfig: ILocalStorageServiceConfig = {
    prefix: "gnomex",
    storageType: "localStorage"
};

/**
 * @since 1.0.0
 */
@NgModule({
    imports: [
        BrowserModule,
        APP_ROUTING,
        HttpModule,
        RouterModule,
        FormsModule,
        HeaderModule,
        HomeModule,
        UserModule,
        ExperimentsModule,
        ConfigurationModule,
        AboutModule,
        NewBillingAccountModule,
        ServicesModule,
        LocalStorageModule.withConfig(localStorageServiceConfig),
        AuthenticationModule.forRoot(),
        CommonModule,
        BrowserAnimationsModule,
        AnalysisModule,
        DatatracksModule,
        TopicsModule,
        MatIconModule,
        MatDialogModule,
        ReportsModule,
        TestPageModule,
        AccountModule,
        UsersGroupsTablistModule,
        WorkflowModule,
        ProductsModule,
        BillingModule,
        AngularSplitModule,
        RegisterUserModule
    ],
    declarations: [GnomexAppComponent],
    bootstrap: [GnomexAppComponent],
    providers: [
        {provide: BROWSE_EXPERIMENTS_ENDPOINT, useValue: "/gnomex/GetExperimentOverviewList.gx"},
        {provide: AUTHENTICATED_USER_ENDPOINT, useValue: "/gnomex/api/user/authenticated"},
        {provide: AUTHENTICATION_DIRECT_ENDPOINT, useValue: "/gnomex/api/user-session"},
        {provide: AUTHENTICATION_TOKEN_ENDPOINT, useValue: "/gnomex/api/token"},
        {provide: AUTHENTICATION_LOGOUT_PATH, useValue: "/gnomex/logout"},
        {provide: AUTHENTICATION_ROUTE, useValue: "/authenticate"},
        {provide: AUTHENTICATION_TOKEN_KEY, useValue: "gnomex-jwt"},
        {provide: AUTHENTICATION_MAX_INACTIVITY_MINUTES, useValue: 1440},
        {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
        {provide: Window, useValue: window},
        ...WINDOW_PROVIDERS,

        UserService,
        AuthenticationService,
        ExperimentsService,
        ProgressService,
        CookieService,
    ]
})
export class GnomexAppModule {
}
