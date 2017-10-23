import { TestBed, async } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule
}  from '@angular/material';
import {FormsModule, FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {HttpModule} from "@angular/http";
import {RouterTestingModule} from "@angular/router/testing";
import {ILocalStorageServiceConfig, LocalStorageService} from "angular-2-local-storage";
import {
    AuthenticationModule, AuthenticationService,
    AUTHENTICATION_LOGOUT_PATH, AUTHENTICATION_ROUTE,
    AUTHENTICATION_TOKEN_KEY, AUTHENTICATION_TOKEN_ENDPOINT, AUTHENTICATION_DIRECT_ENDPOINT, AUTHENTICATION_MAX_INACTIVITY_MINUTES
} from "@hci/authentication";
import {ProgressService} from "../home/progress.service";

let localStorageServiceConfig: ILocalStorageServiceConfig = {
    prefix: "gnomex",
    storageType: "localStorage"
};

describe('Header Component...', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                HeaderComponent
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
                HttpModule,
                NgbModule.forRoot(),
                MatButtonModule,
                MatInputModule,
                MatListModule,
                MatGridListModule,
                MatToolbarModule,
                MatFormFieldModule,
                MatMenuModule,
                FormsModule
            ],
            providers: [{provide: AuthenticationService, useClass: AuthenticationService},
                        {provide:LocalStorageService, useClass: LocalStorageService},
                        {provide: AUTHENTICATION_LOGOUT_PATH, useValue: "https://localhost:8080/auth/logout"},
                        {provide: AUTHENTICATION_DIRECT_ENDPOINT, useValue: "https://localhost:8080/core/api/user/user-session/active"},
                        {provide: AUTHENTICATION_TOKEN_ENDPOINT, useValue: "https://localhost:8080/core/api/token"},
                        {provide: AUTHENTICATION_ROUTE, useValue: "/authentication"},
                        {provide: AUTHENTICATION_TOKEN_KEY, useValue: "jwt_token"},
                        {provide: ProgressService, useClass: ProgressService},
                {provide: ProgressService, useClass: ProgressService},
                        {provide: 'LOCAL_STORAGE_SERVICE_CONFIG', useValue: localStorageServiceConfig}]
        });
    });

    it('should create the component', async(() => {
        let fixture = TestBed.createComponent(HeaderComponent);
        let app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it('Experiment menu should not be visible', async(() => {
        let fixture = TestBed.createComponent(HeaderComponent);
        let ne = fixture.nativeElement;
        let expMenuPresent: boolean = false;
        fixture.detectChanges();
        for (let node of ne.querySelectorAll('.experiment-menu')) {
            if (node.textContent === 'Details header') {
                expMenuPresent = true;
                break;
            }
        }
        expect(expMenuPresent).toBeFalsy();
    }));

});