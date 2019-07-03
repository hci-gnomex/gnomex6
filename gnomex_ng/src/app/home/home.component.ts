import {Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy} from "@angular/core";
import {URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {Subscription} from "rxjs";
import {jqxProgressBarComponent} from "../../assets/jqwidgets-ts/angular_jqxprogressbar";
import {GnomexService} from "../services/gnomex.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {ProgressService} from "./progress.service";
import {first} from "rxjs/operators";
import {AuthenticationService} from "../auth/authentication.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {PropertyService} from "../services/property.service";

@Component({
    selector: "gnomex-home",
    template: `
        <div class="full-width full-height horizontal-center">
            <div *ngIf="hideLoader | async; else loading"
                 class="full-width full-height flex-container-col">
                <div class="flex-grow">
                </div>
                <div class="horizontal-center">
                    <img [src]="site_splash" alt="">
                </div>
                <div class="flex-grow-large flex-container-col">
                    <div class="flex-grow multiline flex-container-col justify-center">
                        <h2>{{ this.bulletin }}</h2>
                    </div>
                    <div class="flex-container-row full-width">
                        <div class="flex-grow"></div>
                        <div class="small-font padded major-padded-right">{{ firstLastName }}</div>
                        <div class="small-font padded multiline">{{ permissionsText }}</div>
                    </div>
                </div>
            </div>
            <ng-template #loading>
                <div class="full-width full-height flex-container-col">
                    <div class="flex-grow">
                    </div>
                    <div class="flex-container-row">
                        <div class="flex-grow">
                        </div>
                        <div class="gnomex-splash">
                            <div class="horizontal-center">
                                <img [src]=site_logo alt="">
                            </div>
                            <div class="full-width progress-bar-container">
                                <mat-progress-bar  mode="determinate" [value]="this.loadingProgress">
                                </mat-progress-bar>
                            </div>
                        </div>
                        <div class="flex-grow">
                        </div>
                    </div>
                    <div class="flex-grow">
                    </div>
                </div>
            </ng-template>
        </div>
    `,
    styles: [`
        .horizontal-center { text-align: center; }

        .flex-grow-large { flex: 4; }

        .multiline { white-space: pre-line; }

        .major-padded-right { padding-right: 1em; }
        

        .progress-bar-container {
            width: 90%;
            position: absolute;
            bottom: 5em;
        }

        .gnomex-splash {
            background-image: url(../gnomex/assets/gnomex_splash_credits.png);
            width: 19em;
            height: 15em;
            padding: 1em;
            position: relative;
            background-repeat: no-repeat;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    loadingProgress: number = 0;

    private showProgressSubscription: Subscription;
    public hideLoader: BehaviorSubject<boolean>;
    public colorRanges = [{ stop: 100, color: '#3fca15' }];
    private launchProperties: any;
    public site_splash: string;

    public site_logo:string;
    public bulletin: string = "";

    public firstLastName: string = '';
    public permissionsText: string = '';

    public searchText: string;



    constructor(private launchPropertiesService: LaunchPropertiesService,
                private progressService: ProgressService,
                private gnomexService: GnomexService,
                private createSecurityAdvisor: CreateSecurityAdvisorService,
                private router:Router,
                private authService: AuthenticationService,
                private propertyService: PropertyService
    ) {
        // Do instance configuration here
    }
    ngAfterViewInit() {
        this.showProgressSubscription = this.progressService.loaderStatus.subscribe((value) => {
            this.loadingProgress = value;
            if (value === 100) {
                this.progressService.hideLoaderStatus(true);
                this.setupUserAndPermissionsStrings();
                this.setBulletin();
            }

        });
    }
    ngOnInit() {

        if(!this.progressService.hideLoader){
            this.progressService.hideLoader = new BehaviorSubject<boolean>(false);
            this.hideLoader = this.progressService.hideLoader;
        }else{
            this.hideLoader = this.progressService.hideLoader;
        }

        let params: URLSearchParams = new URLSearchParams();

        this.launchPropertiesService.getLaunchProperties(params).pipe(first()).subscribe((response: any) => {
            this.launchProperties = response;
            this.getProps(response);
            this.gnomexService.coreFacilityList = response.CoreFacilities;
            this.progressService.displayLoader(10);

        });

        if(!this.gnomexService.isLoggedIn){

            if(this.gnomexService.orderInitObj){
                if(this.gnomexService.orderInitObj.isGuest){
                    this.gnomexService.initGuestApp();
                }else{
                    this.gnomexService.initApp();
                }
            } else if (this.authService.isGuestMode()) {
                this.gnomexService.initGuestApp();
            } else {
                this.gnomexService.initApp();
            }
        }

        this.gnomexService.isAppInitCompleteObservable().pipe(first()).subscribe(() =>{
            if (this.gnomexService.redirectURL) {
                this.router.navigateByUrl("/" + this.gnomexService.redirectURL);
            }
        });

        this.setupUserAndPermissionsStrings();
        this.setBulletin();
    }

    private setBulletin(): void {
        this.bulletin = "";
        let bulletinProperty: string = this.propertyService.getPropertyValue(PropertyService.PROPERTY_BULLETIN);
        if (bulletinProperty) {
            this.bulletin = "Bulletin\n" + bulletinProperty;
        }
    }

    getProps(response: any) {

        for (let p of response.Property) {
            switch(p.name) {
                case "site_splash" : {
                    this.site_splash = p.value;
                    break;
                }
                case "site_logo" : {
                    this.site_logo = p.value;
                    break;
                }
                case "university_user_authentication" : {
                    this.gnomexService.isUniversityUserAuthentication = (p.value === "Y");
                    break;
                }
            }
        }
        if (!this.site_splash) {
            this.site_splash = "./assets/gnomex_splash_logo.png";
        }
        if (!this.site_logo) {
            this.site_logo = "./assets/gnomex_logo.png";
        }
    }

    private setupUserAndPermissionsStrings() {

        this.firstLastName = this.createSecurityAdvisor.userName;

        this.permissionsText = '??? permissions';

        if (this.createSecurityAdvisor.isSuperAdmin) {
            this.permissionsText = 'Super Admin privileges';
        } else if (this.createSecurityAdvisor.isBillingAdmin) {
            this.permissionsText = 'Billing Admin privileges';
        } else if (this.createSecurityAdvisor.isAdmin) {
            this.permissionsText = 'Admin privileges';
        } else if (this.createSecurityAdvisor.isGuest) {
            if (this.createSecurityAdvisor.isUniversityOnlyUser) {
                // This is the special "UnivGuestState" from the flex version
                this.permissionsText = 'Restricted - For additional access, please sign up for a GNomEx user account\n'
                    + 'University guest access';
            } else {
                // The regular guest state
                this.permissionsText = 'Guest privileges only';
            }
        } else {
            if ((this.createSecurityAdvisor.hasPermission("canSubmitRequests")
                && this.gnomexService.canSubmitRequestForALab())
                || this.createSecurityAdvisor.hasPermission("canSubmitForOtherCores")) {

                if (!this.gnomexService.isExternalDataSharingSite) {
                    this.permissionsText = '';
                }
            } else {
                // this is the "UserNonSubmitterState" from the old version
                this.permissionsText = 'Restricted access - Please contact GNomEx support or a core facility director.';
            }
        }
    }

    ngOnDestroy(): void {
        this.showProgressSubscription.unsubscribe();
    }
}
