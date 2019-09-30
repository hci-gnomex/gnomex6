import {
    AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ProgressService} from "../home/progress.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DictionaryService} from "../services/dictionary.service";
import {Router} from "@angular/router";
import {LabListService} from "../services/lab-list.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {GnomexService} from "../services/gnomex.service";
import {ExternalRoute} from "./external-routes.module";
import * as _ from "lodash";
import {TopicService} from "../services/topic.service";
import {MatDialogConfig, MatToolbar} from "@angular/material";
import {AdvancedSearchComponent} from "./advanced_search/advanced-search.component";
import {AuthenticationService} from "../auth/authentication.service";
import {PropertyService} from "../services/property.service";
import {Subscription} from "rxjs/index";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: "gnomex-header",
    templateUrl: "./header.component.html",
    styles: [`
        
        .minimize {
            width:  fit-content;
            height: fit-content;
        }
        
        .red {
            /*font-weight: bold;*/
            color: red;
        }
        
        .horizontal-spacing-center {
            text-align: center;
        }
        
        .no-padding-dialog .mat-dialog-container {
            padding: 0;
        }
        .no-padding-dialog .mat-dialog-container .mat-dialog-actions{
            background-color: #eeeeeb;
        }
        .lookup {
            font-size: small;
            text-decoration: none;
        }
        .header-one {
            color: black;
            background-color: white;
            position: fixed;
            z-index: 1;
        }
        .header-two {
            background-color: #f5fffa;
            color: black;
        }
        .top-menu-item {
            flex: 1;
        }
        .right-align {
            text-align: right;
        }
        .links {
            flex: .25;
            text-decoration: none;
        }
        .link {
            font-size: small;
            color: inherit;
            text-decoration: none;
            text-align: center;
        }
        .problem {
            color: red !important;
            text-decoration: underline !important;
        }
        .header-flex0 {
            flex: 0 !important;
        }
        [hidden] {
            display: none !important;
            flex: 0 !important;
        }
        .mat-menu-panel.no-max-width {
            max-width: none;
        }
        .inline-block { display: inline-block; }
        .horizontal-padding { padding: 0 0.4em; }
        .horizontal-center { text-align: center; }
    `],
    encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('headerRef') headerRef: MatToolbar;
    @ViewChild('spacerRef') spacerRef: ElementRef;

    options: FormGroup;

    constructor(private authenticationService: AuthenticationService,
                private progressService: ProgressService,
                private dictionaryService: DictionaryService,
                private launchPropertiesService: LaunchPropertiesService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private topicsService: TopicService,
                private router: Router,
                private labListService: LabListService,
                private gnomexService: GnomexService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService) {

        this.options = this.formBuilder.group({
            hideRequired: false,
            floatPlaceholder: 'auto',
        });
    }

    public objNumber: string;
    public searchText: string;

    public navItems: any[];
    private adminNavItems: any[];
    private userNavItems: any[];
    private billingAdminNavItems: any[];
    private billingAdminSubmitterNavItems: any[];
    private adminPlateBasedNavItems: any[];
    private billingAdminESNavItems: any[];
    private managerNavItems: any[];
    private managerESNavItems: any[];
    private userNonSubmitterNavItems: any[];
    private userESNavItems: any[];
    private guestNavItems: any[];

    private currentState: string;
    private isAdminState: boolean = false;
    public linkNavItems: any[] = [];

    private headerHeight: number = 0;
    private userGuideRoute: string = "";

    private isAppInitCompleteSubscription: Subscription;
    private isLoggedInSubscription: Subscription;

    ngOnInit() {
        this.isAppInitCompleteSubscription = this.gnomexService.isAppInitCompleteObservable().subscribe(() => {
            this.buildNavItems();
            this.checkSecurity();
            this.gnomexService.isGuestState = this.createSecurityAdvisorService.isGuest;
            this.addQuickLinks();
        });

        this.isLoggedInSubscription = this.gnomexService.isLoggedIn_BehaviorSubject.subscribe((isLoggedIn: boolean) => {
            this.resizeHeaderSpacing();
        });
    }

    ngOnDestroy(): void {
        if (this.isAppInitCompleteSubscription) {
            this.isAppInitCompleteSubscription.unsubscribe()
        }
        if (this.isLoggedInSubscription) {
            this.isLoggedInSubscription.unsubscribe()
        }
    }

    ngAfterViewChecked() {
        this.resizeHeaderSpacing();
    }

    @HostListener('window:resize')
    onResize() {
        this.resizeHeaderSpacing();
    }

    private resizeHeaderSpacing(): void {
        if (!this.gnomexService.isLoggedIn
            && this.spacerRef
            && this.spacerRef.nativeElement
            && this.spacerRef.nativeElement.style) {

            this.spacerRef.nativeElement.style.height = 'initial';
            this.spacerRef.nativeElement.style.height = '0px';

        } else if (this.spacerRef
            && this.spacerRef.nativeElement
            && this.spacerRef.nativeElement.style
            && this.headerRef
            && this.headerRef._elementRef
            && this.headerRef._elementRef.nativeElement
            && this.headerRef._elementRef.nativeElement.offsetHeight
            && this.headerRef._elementRef.nativeElement.offsetHeight > 0) {

            this.headerHeight = this.headerRef._elementRef.nativeElement.offsetHeight;

            this.spacerRef.nativeElement.style.height = 'initial';
            this.spacerRef.nativeElement.style.height = '' + Math.ceil(this.headerHeight) + 'px';
        }
    }

    public buildNavItems() {
        this.resetNavItems();
        this.createUserGuideRouterLink();

        this.linkNavItems = [
            {
                displayName: 'Report Problem',
                class: 'problem',
                route: [{outlets: {modal: ['reportProblem']}}]
            },
            {
                displayName: 'Links',
                context: 'quickLinks'

            },
            {
                displayName: 'Help',
                children: [
                    {
                        displayName: 'User Guide',
                        class: 'mat-menu-item',
                        route: this.userGuideRoute
                    },
                    {
                        displayName: 'About',
                        class: 'mat-menu-item',
                        route: [{outlets: {'modal': 'about-window-modal'}}]
                    },
                    {
                        displayName: 'Contact Us',
                        class: 'mat-menu-item',
                        route: [{outlets: {'modal': 'contact-us-window-modal'}}]
                    }
                ]
            },
            {
                displayName: 'Account',
                children: [
                    {
                        displayName: 'My Account',
                        context: 'browseExperiments',
                        iconName: './assets/white_information.png',
                        route: './MyAccount'
                    },
                    {
                        displayName: 'Sign out',
                        iconName: './assets/flask.png',
                        route: [{outlets: {'modal': 'logout'}}]
                    }
                ]
            }
        ];

        this.guestNavItems = [
            {
                displayName: 'Experiments',
                class: 'top-menu-item',
                iconName: './assets/flask.png',
                route: '/experiments',
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Protocols',
                iconName: './assets/brick.png',
                class: 'top-menu-item',
                route: '/manage-protocols'
            },
        ];

        this.userNavItems = [
            {
                displayName: 'New Experiment Order',
                iconName: './assets/flask_add.png',
                class: 'top-menu-item',
                context: 'newExperimentOrder',
                route: ''
            },
            {
                displayName: 'Experiments',
                class: 'top-menu-item',
                iconName: './assets/flask.png',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        iconName: './assets/flask_add.png',
                        context: 'newExperimentOrder',
                        route: ''
                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: './assets/flask_edit.png',
                        route: 'amend-experiment'
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: './assets/experiment_register.png',
                        route: '/new-external-experiment'
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: './assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Products',
                context: 'product',
                class: 'top-menu-item',
                iconName: './assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: './assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    }
                ]
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        context: 'usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }
        ];

        this.managerNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        iconName: './assets/flask_add.png',
                        context: 'newExperimentOrder',
                        route: ''
                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: './assets/flask_edit.png',
                        route: 'amend-experiment'
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: './assets/experiment_register.png',
                        route: '/new-external-experiment'
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: './assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Products',
                context: 'product',
                class: 'top-menu-item',
                iconName: './assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: './assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    }
                ]
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }
        ];

        this.managerESNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiments and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: './assets/flask_add.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: './assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }
        ];

        this.adminNavItems = [
            {
                displayName: 'Orders',
                iconName: './assets/review.png',
                route: '/experiments-orders',
            },
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        context: 'newExperimentOrder',
                        iconName: './assets/flask_add.png',

                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: './assets/flask_edit.png',
                        route: 'amend-experiment'
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: './assets/experiment_register.png',
                        route: '/new-external-experiment'
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: './assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    },
                    {
                        displayName: 'Orders',
                        iconName: './assets/review.png',
                        route: '/experiments-orders',
                    },
                    {
                        displayName: 'Bulk Sample Sheet Import',
                        iconName: './assets/review.png',
                        route: [{outlets: {'modal': 'BulkSampleUpload'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Workflow...',
                class: 'top-menu-item',
                iconName: './assets/review.png',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: './assets/data-accept.png',
                        route: '/qcWorkFlow'
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina - Lib Prep',
                        context: 'ILLSEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Lib Prep QC',
                        context: 'ILLSEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepQcWorkFlow'
                    },
                    {
                        displayName: 'Illumina - FlowCell Assembly',
                        context: 'ILLSEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/flowcellassmWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Finalize Flow Cell',
                        context: 'ILLSEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/finalizeWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Data Pipeline',
                        context: 'ILLSEQ',
                        iconName: './assets/page_go.png',
                        route: '/pipelineWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Flow Cells',
                        context: 'ILLSEQ',
                        iconName: './assets/rectangle.png',
                        route: '/flowcellWorkFlow'
                    },
                    {
                        divider: true
                    },
/*
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: './assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: './assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: './assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: './assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },

 */
                    {
                        displayName: 'Workflow (all)',
                        iconName: './assets/building_go.png',
                        route: ''
                    },
/*
                    {
                        divider: true
                    },
                    {
                        displayName: 'Fill Plate',
                        iconName: './assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Build Run',
                        iconName: './assets/run_add.png',
                        route: ''
                    },
                    {
                        displayName: 'Plates & Runs',
                        iconName: './assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Results',
                        iconName: './assets/tv_chart_review.png',
                        route: ''
                    },
*/
                ]
            },
            {
                displayName: 'Workflow',
                class: 'top-menu-item',
                iconName: './assets/review.png',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: './assets/data-accept.png',
                        route: '/qcWorkFlow'
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina - Lib Prep',
                        context: 'ILLSEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Lib Prep QC',
                        context: 'ILLSEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepQcWorkFlow'
                    },
                    {
                        displayName: 'Illumina - FlowCell Assembly',
                        context: 'ILLSEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/flowcellassmWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Finalize Flow Cell',
                        context: 'ILLSEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/finalizeWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Data Pipeline',
                        context: 'ILLSEQ',
                        iconName: './assets/page_go.png',
                        route: '/pipelineWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Flow Cells',
                        context: 'ILLSEQ',
                        iconName: './assets/rectangle.png',
                        route: '/flowcellWorkFlow'
                    },

                    {
                        divider: true
                    },
/*
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: './assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: './assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: './assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: './assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },
 */
                    {
                        displayName: 'Workflow (all)',
                        iconName: './assets/building_go.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Products...',
                context: 'product',
                class: 'top-menu-item',
                iconName: './assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: './assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    },
                    {
                        displayName: 'Configure Products',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-products'
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: './assets/money.png',
                route: '/browse-billing'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: './assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: './assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: './assets/page_white_wrench.png',
                        route: 'configure-experiment-platform'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: './assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    },
                    {
                        displayName: 'Configure Billing Account Fields',
                        iconName: './assets/page_white_wrench.png',
                        route: ''
                    },

                ]
            },
            {
                displayName: 'Reports',
                context: 'browseExperiments',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    },
                    {
                        displayName: 'Send email to all GNomEx users',
                        iconName: './assets/email_go.png',
                        route: [{outlets: {modal: ['EmailAll']}}]
                    }
                ]
            }

        ];

        this.adminPlateBasedNavItems = [
            {
                displayName: 'Orders',
                iconName: './assets/review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Fill Plate',
                iconName: './assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Build Run',
                iconName: './assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Plates & Runs',
                iconName: './assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Results',
                iconName: './assets/tv_chart_review.png',
                class: 'top-menu-item',
                route: ''
            },
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        context: 'newExperimentOrder',
                        iconName: './assets/flask_add.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: './assets/experiment_register.png',
                        route: '/new-external-experiment'
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: './assets/money.png',
                        //route: "['/NewBillingAccount', {outlets: {'modal   {outlets: {modal: '/NewBillingAccount'}}]"
                        //route: '[{outlets: {"modal": ["NewBillingAccountModal"]}}]'
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Workflow...',
                iconName: './assets/review.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: './assets/data-accept.png',
                        route: '/qcWorkFlow'
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina - Lib Prep',
                        context: 'HISEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Lib Prep QC',
                        context: 'HISEQ',
                        iconName: './assets/flask.png',
                        route: '/libprepQcWorkFlow'
                    },
                    {
                        displayName: 'Illumina - FlowCell Assembly',
                        context: 'HISEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/flowcellassmWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Finalize Flow Cell',
                        context: 'HISEQ',
                        iconName: './assets/DNA_diag_lightening.png',
                        route: '/finalizeWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Data Pipeline',
                        context: 'HISEQ',
                        iconName: './assets/page_go.png',
                        route: '/pipelineWorkFlow'
                    },
                    {
                        displayName: 'Illumina - Flow Cells',
                        context: 'HISEQ',
                        iconName: './assets/rectangle.png',
                        route: '/flowcellWorkFlow'
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: './assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: './assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: './assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: './assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Workflow (all)',
                        iconName: './assets/building_go.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Fill Plate',
                        iconName: './assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Build Run',
                        iconName: './assets/run_add.png',
                        route: ''
                    },
                    {
                        displayName: 'Plates & Runs',
                        iconName: './assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Results',
                        iconName: './assets/tv_chart_review.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Products',
                context: 'product',
                iconName: './assets/basket.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: './assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    },
                    {
                        displayName: 'Configure Products',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-products'
                    },
                ]
            },
            {
                displayName: 'Admin',
                iconName: './assets/group.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Billing',
                        iconName: './assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    },
                    {
                        displayName: 'Users & Groups',
                        iconName: './assets/group.png',
                        route: '/UsersGroups'
                    },
                    {
                        displayName: 'Send email to all GNomEx users',
                        iconName: './assets/email_go.png',
                        route: [{outlets: {modal: ['EmailAll']}}]
                    }
                ]
            },
            {
                displayName: 'Configure',
                iconName: './assets/page_white_wrench.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: './assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: './assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: './assets/page_white_wrench.png',
                        route: 'configure-experiment-platform'
                    },
                    {
                        displayName: 'Configure Billing Account Fields',
                        iconName: './assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: './assets/page_white_wrench.png',
                        route: '/manage-protocols'
                    }

                ]
            },
            {
                displayName: 'Reports',
                iconName: './assets/page.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ];

        this.billingAdminNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                route: ''
            },
            {
                displayName: 'Products',
                class: 'top-menu-item',
                context: 'products',
                iconName: './assets/basket.png',
                children: [
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: './assets/money.png',
                route: '/browse-billing'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'New Billing Account',
                class: 'top-menu-item',
                iconName: './assets/money.png',
                route: ''
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ];

        this.billingAdminSubmitterNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
/*                    // A Billing Admin user should not have permission to create a new experiment.
                    {
                        displayName: 'New Experiment Order',
                        context: "newExperimentOrder",
                        iconName: './assets/flask_add.png',
                        route: ''
                    }
 */
                ]
            },
            {
                displayName: 'Products',
                class: 'top-menu-item',
                context: 'product',
                iconName: './assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: "newProductOrder",
                        iconName: './assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: './assets/review.png',
                        route: '/product-orders'
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: './assets/review.png',
                        route: '/product-ledger'
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: './assets/money.png',
                route: '/browse-billing'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'New Billing Account',
                class: 'top-menu-item',
                iconName: './assets/money.png',
                route: ''
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ];

        this.billingAdminESNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiments and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: './assets/flask_add.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Bulk Sample Sheet Import',
                        iconName: './assets/review.png',
                        route: [{outlets: {'modal': 'BulkSampleUpload'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: './assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: './assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: './assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: './assets/page_white_wrench.png',
                        route: 'configure-experiment-platform'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: './assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ];

        this.userESNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: './assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiment and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: './assets/flask_add.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: './assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: './assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: './assets/page_white_wrench.png',
                        route: '/configure-organisms'
                    },
                    {
                        displayName: 'Protocols',
                        iconName: './assets/brick.png',
                        route: '/manage-protocols'
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: './assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: './assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: './assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: './assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }
        ];

        this.userNonSubmitterNavItems = [
            {
                displayName: 'Experiments',
                iconName: './assets/flask.png',
                class: 'top-menu-item',
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: './assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: './assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: './assets/topic_tag.png',
                route: '/topics'
            }
        ];
    }

    public searchNumber() {
        this.gnomexService.navByNumber(this.objNumber);
    }

    public searchByText() {
        let data = { searchText: this.searchText };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "60em";
        configuration.height = "45em";
        configuration.autoFocus = false;
        configuration.data = data;

        this.dialogsService.genericDialogContainer(AdvancedSearchComponent, "Advanced Search", null, configuration);
    }

    public resetNavItems() {
        this.managerESNavItems = _.cloneDeep([]);
        this.userNonSubmitterNavItems = _.cloneDeep([]);
        this.linkNavItems = _.cloneDeep([]);
        this.managerNavItems = _.cloneDeep([]);
        this.userESNavItems = _.cloneDeep([]);
        this.adminPlateBasedNavItems = _.cloneDeep([]);
        this.billingAdminSubmitterNavItems = _.cloneDeep([]);
        this.billingAdminNavItems = _.cloneDeep([]);
        this.userNavItems = _.cloneDeep([]);
        this.adminNavItems = _.cloneDeep([]);
        this.billingAdminESNavItems = _.cloneDeep([]);
        this.guestNavItems = _.cloneDeep([]);
        this.navItems = _.cloneDeep([]);
    }

    private createMenuItem(displayName: string, context: string, icon: string, route: string, idCoreFacility: string, children: any[]): any {
        return {
            displayName: displayName,
            idCoreFacility: idCoreFacility,
            context: context,
            iconName: icon,
            children: children,
            route: route
        };
    }

    private createExperimentMenuItem(displayName: string, context: string, icon: string, route: string, idCoreFacility: string, children: any[]): any {
        return {
            displayName: displayName,
            context: context,
            iconName: icon,
            children: children,
            route: '' + route + (!!idCoreFacility ? '/' + idCoreFacility : '')
        };
    }

    private createLinkMenuItem(displayName: string, context: string, icon: string, route: string, idCoreFacility: string, children: any[]): any {
        let index = displayName.indexOf(' ');
        let startRoute: string = "";
        if (index === -1) {
            startRoute = displayName;
        } else {
            startRoute = displayName.substring(0, displayName.indexOf(' '));
        }
        this.router.config.push(new ExternalRoute(startRoute, route));
        return {
            displayName: displayName,
            context: context,
            iconName: icon,
            route: '/' + startRoute,
            children: children
        };
    }

    private createModalMenuItem(displayName: string, context: string, icon: string, route: any, idCoreFacility: string, children: any[]): any {
        return {
            displayName: displayName,
            context: context,
            iconName: icon,
            route: route,
            children: children
        };
    }

    private addQuickLinks(): void {
        for (let lni of this.linkNavItems) {
            if (lni.displayName === "Links") {
                lni.children = [];
                let lniCtr = 0;
                for (let item of this.gnomexService.faqList) {
                    lni.children[lniCtr] = this.createLinkMenuItem(item.title, "", "", item.url, "", []);
                    lniCtr++;
                }
                if (this.isAdminState) {
                    lni.children[lniCtr] = this.createModalMenuItem("Manage...", "", "", [{outlets: {modal: ['manageLinks']}}], "", []);
                    lniCtr++;
                }
                break;
            }
        }
    }

    private hideMenusByContext(navMenu: any[], context: string): void {
        let menuItemCtr = 0;
        for (let menuItem of navMenu) {
            if (menuItem.context === context) {
                navMenu[menuItemCtr].hidden = true;
                navMenu[menuItemCtr].class = 'header-flex0';
                menuItemCtr++;
            } else {
                menuItemCtr++;
            }
            if (menuItem.children) {
                this.hideMenusByContext(menuItem.children, context);
            }
        }
    }

    private addNewExperimentMenus(navMenu: any[]): void {
        for (let menuItem of navMenu) {
            if (menuItem.context === "newExperimentOrder") {
                if (this.gnomexService.myCoreFacilities) {
                    let myActiveCoreFacilities = this.gnomexService.myCoreFacilities.filter((core: any) => core.isActive === "Y");
                    if (myActiveCoreFacilities.length === 1) {
                        menuItem.route = "/newExperiment/" + myActiveCoreFacilities[0].idCoreFacility;
                    } else if (myActiveCoreFacilities.length > 1) {
                        menuItem.children = this.addCoreNewExperiments(menuItem, [], myActiveCoreFacilities);
                    }
                }
            }
            if (menuItem.children) {
                this.addNewExperimentMenus(menuItem.children);
            }
        }
    }

    /**
     * Only add if core has request categories.
     * @param template
     * @param {any[]} children
     * @returns {any[]}
     */
    private addCoreNewExperiments(template: any, children: any[], myActiveCoreFacilities: any[]): any[] {
        let coreCtr: number = 0;

        for (let core of myActiveCoreFacilities) {
            if (core.hasRequestCategories === 'Y') {
                let label: string = template.displayName + " for " + core.facilityName;
                let route: string = "/newExperiment";
                children[coreCtr] = this.createExperimentMenuItem(label, "", template.iconName, route, core.idCoreFacility, []);
                coreCtr++;
            }
        }

        return children;
    }

    private addProductOrderMenus(navMenu: any[]): void {
        for (let menuItem of navMenu) {
            if (menuItem.context === "newProductOrder") {
                if (this.gnomexService.myCoreFacilities) {
                    let myActiveCoreFacilities = this.gnomexService.myCoreFacilities.filter((core: any) => core.isActive === "Y");
                    if (myActiveCoreFacilities.length === 1) {
                        menuItem.route = "/order-products/" + myActiveCoreFacilities[0].idCoreFacility;
                    } else if (myActiveCoreFacilities.length > 1) {
                        menuItem.children = this.addCoreNewProducts(menuItem, [], myActiveCoreFacilities);
                    }
                }
            }
            if (menuItem.children) {
                this.addProductOrderMenus(menuItem.children);
            }
        }
    }

    /**
     * Only add if core has request categories.
     *
     * @param template
     * @param {any[]} children
     * @returns {any[]}
     */
    private addCoreNewProducts(template: any, children: any[], myActiveCoreFacilities: any[]): any[] {
        let coreCtr: number = 0;
        for (let core  of myActiveCoreFacilities) {
            for (let pt of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.ProductType")) {
                if (pt.idCoreFacility === core.idCoreFacility) {
                    let label: string = template.displayName + " for " + core.facilityName;
                    let route: string = "/order-products/";
                    children[coreCtr] = this.createMenuItem(label, "", template.iconName, route + core.idCoreFacility, core.idCoreFacility,  []);
                    coreCtr++;
                    break;
                }
            }
        }
        return children;
    }

    private hideMenusByProperties(navMenu: any[]): void {
        let showMenus: string[] = [];
        let hideMenus: string[] = [];
        for (let property of this.dictionaryService.getEntries("hci.gnomex.model.PropertyDictionary")) {
            if (!property.value) {
                continue;
            }
            if (property.propertyName.startsWith("menu_")) {
                this.parseMenuProperty(property, "show", "hide", "hide super", property.propertyName.substr(5), showMenus, hideMenus);
            } else if (property.propertyName === PropertyService.PROPERTY_ALLOW_ADD_SEQUENCING_SERVICES) {
                this.parseMenuProperty(property, "Y", "N", null, "Add Additional Illumina Sequencing Lanes", showMenus, hideMenus);
            }
        }
        for (let key of hideMenus) {
            if (!showMenus.includes(key)) {
                for (let menu of navMenu) {
                    if (menu.displayName === key) {
                        menu.hidden = true;
                        menu.class = 'header-flex0';
                        break;
                    } else {
                        let cn: any[] = menu.children;
                        if (cn) {
                            for (let child of cn) {
                                if (child.displayName === key) {
                                    child.hidden = true;
                                    child.class = 'header-flex0';
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private parseMenuProperty(property: any, showValue: string, hideValue: string, hideSuperValue: string, menuName: string, showMenus: string[], hideMenus: string[]): void {
        let menuToHideShow: string;
        if (property.propertyValue === hideValue || property.propertyValue === showValue) {
            if (property.idCoreFacility && !this.createSecurityAdvisorService.isSuperAdmin) {
                if (this.createSecurityAdvisorService.coreFacilitiesICanManage.length > 0) {
                    // Only hide a menu for a core facility admin when
                    // the property matches the core facility
                    // the admin manages.
                    for (let cf of this.createSecurityAdvisorService.coreFacilitiesICanManage) {
                        if (property.idCoreFacility === cf.idCoreFacility) {
                            menuToHideShow = menuName;
                            break;
                        }
                    }
                } else {
                    // Only hide a menu when the property matches the
                    // core facility and the user is only associated with ONE
                    // core facility
                    if (this.gnomexService.myCoreFacilities.length < 2) {
                        for (let cf1 of this.gnomexService.myCoreFacilities) {
                            if (property.idCoreFacility === cf1.idCoreFacility) {
                                menuToHideShow = menuName;
                                break;
                            }
                        }
                    }
                }
            } else if (!property.idCoreFacility) {
                menuToHideShow = menuName;
            }
        } else if (hideSuperValue && property.propertyValue === hideSuperValue && this.createSecurityAdvisorService.isSuperAdmin) {
            menuToHideShow = menuName;
        }
        if (menuToHideShow) {
            if (property.propertyValue === hideValue || (hideSuperValue && property.propertyValue === hideSuperValue)) {
                hideMenus.push(menuToHideShow);
            } else if (property.propertyValue === showValue) {
                showMenus.push(menuToHideShow);
            }
        }
    }

    /**
     * Hide menu items matching context
     * @param {any[]} navMenu
     */
    private customizeMenus(navMenu: any[]): void {
        if (!this.gnomexService.showBioinformaticsLinks) {
            this.hideMenusByContext(navMenu, "bioinformatics");
        }
        if (!this.gnomexService.showUsage) {
            this.hideMenusByContext(navMenu, "usage");
        }
        if (!this.gnomexService.usesExperimentType("MISEQ")) {
            this.hideMenusByContext(navMenu, "MISEQ");
        }
        if (!this.gnomexService.usesExperimentType("HISEQ")) {
            this.hideMenusByContext(navMenu, "HISEQ");
        }
        if (!this.gnomexService.usesExperimentType("QC") && !this.gnomexService.usesExperimentType("MISEQ") && !this.gnomexService.usesExperimentType("HISEQ")) {
            this.hideMenusByContext(navMenu, "QC");
        }
        if (!this.gnomexService.usesExperimentType("MICROARRAY")) {
            this.hideMenusByContext(navMenu, "microarray");
        }
        if (this.createSecurityAdvisorService.isGuest) {
            this.hideMenusByContext(navMenu, "guest");
        }
        if (this.gnomexService.getMyCoreThatUseProducts().length <= 0) {
            this.hideMenusByContext(navMenu, "product");
        }
        if (this.gnomexService.allowExternal === false) {
            this.hideMenusByContext(navMenu, "newExternalExperiment");
        }
    }

    /**
     * Determine currentState.
     * Set the navItems.
     */
    public checkSecurity(): void {
        this.isAdminState = false;
        this.navItems = [];
        this.customizeMenus(this.adminNavItems);
        this.customizeMenus(this.userNavItems);
        this.customizeMenus(this.billingAdminNavItems);
        this.customizeMenus(this.billingAdminSubmitterNavItems);
        this.customizeMenus(this.adminPlateBasedNavItems);
        this.customizeMenus(this.managerNavItems);

        if (this.createSecurityAdvisorService.isGuest || this.createSecurityAdvisorService.isUniversityOnlyUser) {
            this.currentState = "GuestState";
        } else if (this.gnomexService.hasPermission(CreateSecurityAdvisorService.CAN_ACCESS_ANY_OBJECT)) {
            if (this.gnomexService.hasPermission(CreateSecurityAdvisorService.CAN_WRITE_ANY_OBJECT)) {
                this.isAdminState = true; // real admin
                if (this.gnomexService.isExternalDataSharingSite) {
                    this.currentState = "AdminESState";
                } else if (this.gnomexService.managesPlateBasedWorkflow && !this.createSecurityAdvisorService.isSuperAdmin) {
                    this.currentState = "AdminDNASeqState";
                } else {
                    this.currentState = "AdminState";
                }
            } else if (this.createSecurityAdvisorService.isBillingAdmin) {
                if (this.gnomexService.isExternalDataSharingSite) {
                    this.currentState = "AdminESState";
                } else if (this.gnomexService.managesPlateBasedWorkflow && this.createSecurityAdvisorService.isBillingAdmin) {
                    this.currentState = "BillingAdminDNASeqState";
                } else if (this.gnomexService.hasPermission("canSubmitForOtherCores")) {
                    this.currentState = "BillingAdminSubmitterState";
                } else {
                    this.currentState = "BillingAdminState";
                }
            }
        } else if (this.gnomexService.hasGroupsToManage()) {
                this.currentState = this.gnomexService.isExternalDataSharingSite ? "ManagerESState" : "ManagerState";
        } else if ((this.gnomexService.hasPermission("canSubmitRequests") && this.gnomexService.canSubmitRequestForALab()) ||
                    this.gnomexService.hasPermission("canSubmitForOtherCores")) {
            this.currentState = this.gnomexService.isExternalDataSharingSite ? "UserESState" : "UserState";
        } else {
            this.currentState = "UserNonSubmitterState";
        }

        switch(this.currentState) {
            case "AdminState" : {
                this.navItems = this.adminNavItems;
                break;
            }
            case "UserState" : {
                this.navItems = this.userNavItems;
                break;
            }
            case "UserNonSubmitterState" : {
                this.navItems = this.userNonSubmitterNavItems;
                break;
            }
            case "BillingAdminState" : {
                this.navItems = this.billingAdminNavItems;
                break;
            }
            case "BillingAdminSubmitterState" : {
                this.navItems = this.billingAdminSubmitterNavItems;
                break;
            }
            case "AdminDNASeqState" : {
                this.navItems = this.adminPlateBasedNavItems;
                break;
            }
            case "BillingAdminDNASeqState" : {
                this.navItems = this.adminPlateBasedNavItems;
                break;
            }
            case "UserESState" : {
                this.navItems = this.userESNavItems;
                break;
            }
            case "AdminESState" : {
                this.navItems = this.billingAdminESNavItems;
                break;
            }
            case "ManagerState" : {
                this.navItems = this.managerNavItems;
                break;
            }
            case "ManagerESState" : {
                this.navItems = this.managerESNavItems;
                break;
            }
            case "GuestState" : {
                this.navItems = this.guestNavItems;
                break;
            }
        }

        if (this.createSecurityAdvisorService.isGuest) {
            this.hideMenusByContext(this.linkNavItems, 'quickLinks');
        }

        this.addNewExperimentMenus(this.navItems);
        this.addProductOrderMenus(this.navItems);
        this.hideMenusByProperties(this.navItems);
    }

    private createUserGuideRouterLink(): void {
        let userGuideUrl = this.gnomexService.getProperty(PropertyService.PROPERTY_HELP_URL);
        if(userGuideUrl) {
            this.userGuideRoute = "userGuide";
            this.router.config.push(new ExternalRoute(this.userGuideRoute, userGuideUrl));
        }
        if(this.userGuideRoute) {
            this.userGuideRoute = "/" + this.userGuideRoute;
        }
    }

}
