import {Component, OnInit, AfterViewInit, OnDestroy} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {Subscription} from "rxjs";
import {GnomexService} from "../services/gnomex.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {ProgressService} from "./progress.service";
import {first} from "rxjs/operators";
import {AuthenticationService} from "../auth/authentication.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {PropertyService} from "../services/property.service";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {NavigationService} from "../services/navigation.service";
import {DialogsService} from "../util/popup/dialogs.service";


@Component({
    selector: "gnomex-home",
    template: `
        <div class="full-width full-height horizontal-center">
            <div *ngIf="hideLoader | async; else loading" class="full-width full-height flex-container-col">
                <div *ngIf="this.bulletin" class="flex-grow multiline flex-container-col justify-center">
                    <h3>{{ this.bulletin }}</h3>
                </div>
                <h3 *ngIf="this.splashScreenCoreFacilities.length">GNomEx Core Facilities</h3>
                <div *ngIf="this.splashScreenCoreFacilities.length" class="flex-grow-large flex-container-row justify-center children-margin-right-small">
                    <div *ngFor="let coreInfo of this.splashScreenCoreFacilities" class="flex-container-col info-pane children-margin-bottom-small">
                        <h4>{{coreInfo.facilityName}}</h4>
                        <div class="flex-container-row justify-center children-margin-right">
                            <div class="flex-container-col">
                                <span class="bold">Director: {{coreInfo.contactName}}</span>
                                <span>{{coreInfo.contactRoom}}</span>
                                <span>{{coreInfo.contactPhone}}</span>
                            </div>
                            <span class="divider-span"></span>
                            <div class="flex-container-col">
                                <span class="bold">Lab Info:</span>
                                <span>{{coreInfo.labRoom}}</span>
                                <span>{{coreInfo.labPhone}}</span>
                            </div>
                        </div>
                        <a [href]="'mailto:' + coreInfo.contactEmail">{{coreInfo.contactEmail}}</a>
                        <span class="divider-top-small">
                            Submit an
                            <a [routerLink]="['/newExperiment', coreInfo.idCoreFacility]"> experiment order </a>
                            or
                            <a [routerLink]="['', {outlets: {modal: ['NewBillingAccountModal']}}]"> billing account </a>
                            to {{coreInfo.facilityName}}
                        </span>
                        <div class="flex-grow white-background padding-small" [innerHtml]="coreInfo.description"></div>
                    </div>
                </div>
                <div *ngIf="!this.splashScreenCoreFacilities.length" class="horizontal-center flex-grow-large">
                    <img [src]="site_splash" alt="">
                </div>
                <div class="flex-container-row full-width">
                    <div class="flex-grow"></div>
                    <div class="small-font padded major-padded-right">{{ firstLastName }}</div>
                    <div class="small-font padded multiline">{{ permissionsText }}</div>
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
        
        .info-pane {
            background: #EEEEEE;
            border: 0.1em solid #B7BABC;
            padding: 0.3em;
            font-size: 0.8em;
            width: 40em;
        }
        .white-background {
            background: white;
        }
        .padding-small {
            padding: 0.2em;
        }
        .children-margin-right-small > *:not(:last-child) {
            margin-right: 0.3em;
        }
        .children-margin-right > *:not(:last-child) {
            margin-right: 1em;
        }
        .divider-top-small {
            border-top: 0.02em solid #D7D5D1;
        }
        .divider-span {
            width: 1px;
            height: 100%;
            border-right: 0.02em solid #D7D5D1;
        }
        .children-margin-bottom-small > *:not(:last-child) {
            margin-bottom: 0.5em;
        }
    `],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    loadingProgress: number = 0;

    private showProgressSubscription: Subscription;
    public hideLoader: BehaviorSubject<boolean>;
    private launchProperties: any;
    public site_splash: string;

    public site_logo:string;
    public bulletin: string = "";
    public splashScreenCoreFacilities: any[] = [];

    public firstLastName: string = '';
    public permissionsText: string = '';

    public searchText: string;



    constructor(private launchPropertiesService: LaunchPropertiesService,
                private progressService: ProgressService,
                private gnomexService: GnomexService,
                private navService:NavigationService,
                private createSecurityAdvisor: CreateSecurityAdvisorService,
                private router: Router,
                private authService: AuthenticationService,
                private propertyService: PropertyService,
                private dialogsService: DialogsService,
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
        this.navService.resetNavModeFN();

        if(!this.progressService.hideLoader) {
            this.progressService.hideLoader = new BehaviorSubject<boolean>(false);
            this.hideLoader = this.progressService.hideLoader;
        }else{
            this.hideLoader = this.progressService.hideLoader;
        }

        let params: HttpParams = new HttpParams();

        this.launchPropertiesService.getLaunchProperties(params).pipe(first()).subscribe((response: any) => {
            this.launchProperties = response;
            this.getProps(response);
            if (response.CoreFacilities) {
                this.splashScreenCoreFacilities = UtilService.getJsonArray(response.CoreFacilities, response.CoreFacilities.CoreFacility)
                    .filter((core) => {
                        return core.description;
                    })
                    .sort((core) => {
                        return core.sortOrder;
                    });
            }
            this.gnomexService.coreFacilityList = response.CoreFacilities;
            this.progressService.displayLoader(10);

        }, (err: IGnomexErrorResponse) => {
        });

        if(!this.gnomexService.isLoggedIn){

            if (this.authService.isGuestMode()) {
                this.gnomexService.initGuestApp();
            } else {
                this.gnomexService.initApp();
            }
        }

        this.gnomexService.isAppInitCompleteObservable().pipe(first()).subscribe(() =>{
            if (this.gnomexService.redirectURL) {
                this.dialogsService.addSpinnerWorkItem();
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
