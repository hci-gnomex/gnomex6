/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ProgressService} from "../home/progress.service";
import {AuthenticationService, TimeoutNotificationComponent} from "@hci/authentication";
import {Observable} from "rxjs/Observable";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DictionaryService} from "../services/dictionary.service";
import {Router} from "@angular/router";
import {LabListService} from "../services/lab-list.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {Subscription} from "rxjs/Subscription";
import {GnomexService} from "../services/gnomex.service";
import {ExternalRoute} from "./external-routes.module";
import * as _ from "lodash";

@Component({
    selector: "gnomex-header",
    templateUrl: "./header.component.html",
    styles: [`
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
        .links-menu {
            flex: 1;
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
    `],
    encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit{

    isLoggedIn: Observable<boolean>;
    options: FormGroup;


    constructor(private authenticationService: AuthenticationService,
				        private progressService: ProgressService,
                private dictionaryService: DictionaryService,
                private launchPropertiesService: LaunchPropertiesService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private router:Router,
                private labListService: LabListService,
                private gnomexService: GnomexService,
                private formBuilder: FormBuilder) {

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
    private labList: any[] = [];
    private faqList: any[] = [];
    public linkNavItems: any[] = [];
    private authSubscription: Subscription;

    /**
     * Initialize
     */
    ngOnInit() {
        this.authSubscription = this.authenticationService.isAuthenticated().subscribe(authenticated => {
            this.isLoggedIn = authenticated && this.progressService.hideLoader.asObservable();
            if (authenticated) {
                this.createSecurityAdvisorService.createSecurityAdvisor().subscribe(response => {
                    this.progressService.displayLoader(15);
                    this.dictionaryService.reload(() => {
                        this.progressService.displayLoader(30);
                        this.labListService.getLabList().subscribe((response: any[]) => {
                            this.progressService.displayLoader(45);
                            this.labList = response;
                            this.launchPropertiesService.getFAQ().subscribe((response: any[]) => {
                                this.progressService.displayLoader(60);
                                console.log("subscribe createSecurityAdvisor");
                                if (response != null) {
                                this.faqList = response;
                                }
                                this.gnomexService.myCoreFacilities = this.dictionaryService.coreFacilities();
                                this.progressService.displayLoader(75);
                                this.gnomexService.onDictionariesLoaded().then((response) => {
                                    this.progressService.displayLoader(90);
                                    this.buildNavItems();
                                    this.checkSecurity();
                                    this.gnomexService.isGuestState = this.createSecurityAdvisorService.isGuest;

                                    this.addQuickLinks();
                                    this.progressService.displayLoader(100);
                                    // TODO will need this in future
                                    // this.launchPropertiesService.getSampleSheetUploadURL().subscribe((response: any) => {
                                    //      this.progressService.displayLoader(100);
                                    //     this.gnomexService.uploadSampleSheetURL = response.url;
                                    // });
                                });
                            });
                        });
                    });
                });
            } else {
                this.navItems = [];
            }
        });

        this.gnomexService.faqUpdateObservable.subscribe(response => {
            this.rebuildFAQMenu();
        });

        // Links, Help, Report Problem and Account
    }

    public buildNavItems() {
        this.resetNavItems();
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
                        displayName: 'Enable Help Edit',
                        class: 'mat-menu-item',
                        context: 'helpEdit',
                        iconName: '../../assets/white_information.png',
                        route: ''
                    },
                    {
                        displayName: 'User Guide',
                        class: 'mat-menu-item',
                        route: ''
                    },
                    {
                        displayName: 'About',
                        class: 'mat-menu-item',
                        route: ''
                    },
                    {
                        displayName: 'Contact Us',
                        class: 'mat-menu-item',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Account',
                children: [
                    {
                        displayName: 'My Account',
                        context: 'browseExperiments',
                        iconName: '../../assets/white_information.png',
                        route: './MyAccount'
                    },
                    {
                        displayName: 'Sign out',
                        iconName: '../../assets/flask.png',
                        route: './logout'
                    }
                ]
            }
        ];

        // Guest menu
        this.guestNavItems = [
            {
                displayName: 'Experiments',
                class: 'top-menu-item',
                iconName: '../../assets/flask.png',
            },
            {
                displayName: 'New Billing Account',
                iconName: '../../assets/money.png',
                route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Protocols',
                iconName: '../../assets/topic_tag.png',
                class: 'problem'
            },
        ];


        // User menu
        this.userNavItems = [
            {
                displayName: 'New Experiment Order',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                context: 'newExperimentOrder',
                route: ''
            },
            {
                displayName: 'Experiments',
                class: 'top-menu-item',
                iconName: '../../assets/flask.png',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        iconName: '../../assets/flask.png',
                        context: 'newExperimentOrder',
                        route: ''
                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: '../../assets/flask_edit.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: '../../assets/experiment_register.png',
                        route: ''
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: '../../assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Products',
                context: 'product',
                class: 'top-menu-item',
                iconName: '../../assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        context: 'usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }


        ]

        // Manager menu
        this.managerNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        iconName: '../../assets/flask.png',
                        context: 'newExperimentOrder',
                        route: ''
                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: '../../assets/flask_edit.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: '../../assets/experiment_register.png',
                        route: ''
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: '../../assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Products',
                context: 'product',
                class: 'top-menu-item',
                iconName: '../../assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }


        ]

        this.managerESNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiments and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: '../../assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }
        ]

        // Admin menu
        this.adminNavItems = [
            {
                displayName: 'Orders',
                iconName: '../../assets/review.png',
                route: '/experiments-orders',
            },
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        context: 'newExperimentOrder',
                        iconName: '../../assets/flask.png',

                    },
                    {
                        displayName: 'Add Additional Illumina Sequencing Lanes',
                        iconName: '../../assets/flask_edit.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: '../../assets/experiment_register.png',
                        route: ''
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: '../../assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    },
                    {
                        displayName: 'Orders',
                        iconName: '../../assets/review.png',
                        route: '/experiments-orders',
                    },
                    {
                        displayName: 'Bulk Sample Sheet Import',
                        iconName: '../../assets/review.png',
                        route: '/experiments-orders',
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Workflow...',
                class: 'top-menu-item',
                iconName: '../../assets/review.png',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: '../../assets/data-accept.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'HiSeq - Lib Prep',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Lib Prep QC',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - FlowCell Assembly',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Finalize Flow Cell',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Data Pipeline',
                        context: 'HISEQ',
                        iconName: '../../assets/page_go.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Flow Cells',
                        context: 'HISEQ',
                        iconName: '../../assets/rectangle.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina MiSeq',
                        context: 'MISEQ',
                        iconName: '../../assets/DNA_diag_miseq.png',
                        children: [
                            {
                                displayName: 'Lib Prep',
                                context: 'MISEQ',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Lib Prep QC',
                                context: 'MISEQ',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cell Assembly',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Finalize Flow Cell',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Pipeline',
                                iconName: '../../assets/server_go.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cells',
                                iconName: '../../assets/rectangle.png',
                                route: ''
                            },

                        ]
                    },
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: '../../assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: '../../assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: '../../assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: '../../assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Workflow (all)',
                        iconName: '../../assets/building_go.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Fill Plate',
                        iconName: '../../assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Build Run',
                        iconName: '../../assets/run_add.png',
                        route: ''
                    },
                    {
                        displayName: 'Plates & Runs',
                        iconName: '../../assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Results',
                        iconName: '../../assets/tv_chart_review.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Workflow',
                class: 'top-menu-item',
                iconName: '../../assets/review.png',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: '../../assets/data-accept.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'HiSeq - Lib Prep',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Lib Prep QC',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - FlowCell Assembly',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Finalize Flow Cell',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Data Pipeline',
                        context: 'HISEQ',
                        iconName: '../../assets/page_go.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Flow Cells',
                        context: 'HISEQ',
                        iconName: '../../assets/rectangle.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina MiSeq',
                        context: 'MISEQ',
                        iconName: '../../assets/DNA_diag_miseq.png',
                        children: [
                            {
                                displayName: 'Lib Prep',
                                context: 'MISEQ',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Lib Prep QC',
                                context: 'MISEQ',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cell Assembly',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Finalize Flow Cell',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Pipeline',
                                iconName: '../../assets/server_go.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cells',
                                iconName: '../../assets/rectangle.png',
                                route: ''
                            },

                        ]
                    },
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: '../../assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: '../../assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: '../../assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: '../../assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Workflow (all)',
                        iconName: '../../assets/building_go.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Products...',
                context: 'product',
                class: 'top-menu-item',
                iconName: '../../assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Products',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: '../../assets/money.png',
                route: ''
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: '../../assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: '../../assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: '../../assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Billing Account Fields',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },

                ]
            },
            {
                displayName: 'Reports',
                context: 'browseExperiments',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    },
                    {
                        displayName: 'Send email to all GNomEx users',
                        iconName: '../../assets/email_go.png',
                        route: [{outlets: {modal: ['EmailAll']}}]
                    }
                ]
            }

        ]

        // Admin plate based
        this.adminPlateBasedNavItems = [
            {
                displayName: 'Orders',
                iconName: '../../assets/review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Fill Plate',
                iconName: '../../assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Build Run',
                iconName: '../../assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Plates & Runs',
                iconName: '../../assets/run_review.png',
                class: 'top-menu-item',
                route: '/experiments-orders',
            },
            {
                displayName: 'Results',
                iconName: '../../assets/tv_chart_review.png',
                class: 'top-menu-item',
                route: ''
            },
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        context: 'browseExperiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        context: 'newExperimentOrder',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Upload Experiment data generated at third party facility',
                        context: 'newExternalExperiment',
                        iconName: '../../assets/experiment_register.png',
                        route: ''
                    },
                    {
                        displayName: 'New Billing Account',
                        iconName: '../../assets/money.png',
                        //route: "['/NewBillingAccount', {outlets: {'modal   {outlets: {modal: '/NewBillingAccount'}}]"
                        //route: '[{outlets: {"modal": ["NewBillingAccountModal"]}}]'
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    }
                ]
            },
            {
                displayName: 'Workflow...',
                iconName: '../../assets/review.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'QC',
                        context: 'QC',
                        iconName: '../../assets/data-accept.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'HiSeq - Lib Prep',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Lib Prep QC',
                        context: 'HISEQ',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - FlowCell Assembly',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Finalize Flow Cell',
                        context: 'HISEQ',
                        iconName: '../../assets/DNA_diag_lightening.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Data Pipeline',
                        context: 'HISEQ',
                        iconName: '../../assets/page_go.png',
                        route: ''
                    },
                    {
                        displayName: 'HiSeq - Flow Cells',
                        context: 'HISEQ',
                        iconName: '../../assets/rectangle.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Illumina MiSeq',
                        context: 'MISEQ',
                        iconName: '../../assets/DNA_diag_miseq.png',
                        children: [
                            {
                                displayName: 'Lib Prep',
                                context: 'MISEQPREP',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Lib Prep QC',
                                context: 'MISEQ',
                                iconName: '../../assets/flask.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cell Assembly',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Finalize Flow Cell',
                                iconName: '../../assets/DNA_diag_miseq.png',
                                route: ''
                            },
                            {
                                displayName: 'Pipeline',
                                iconName: '../../assets/server_go.png',
                                route: ''
                            },
                            {
                                displayName: 'Flow Cells',
                                iconName: '../../assets/rectangle.png',
                                route: ''
                            },

                        ]
                    },
                    {
                        displayName: 'Microarray',
                        context: 'microarray',
                        iconName: '../../assets/microarray_small.png',
                        children: [
                            {
                                displayName: 'Labeling',
                                iconName: '../../assets/asterisk_yellow.png',
                                route: ''
                            },
                            {
                                displayName: 'Hyb',
                                iconName: '../../assets/basket_put.png',
                                route: ''
                            },
                            {
                                displayName: 'Extraction',
                                iconName: '../../assets/microarray_small.png',
                                route: ''
                            },
                        ]
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Workflow (all)',
                        iconName: '../../assets/building_go.png',
                        route: ''
                    },
                    {
                        divider: true
                    },
                    {
                        displayName: 'Fill Plate',
                        iconName: '../../assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Build Run',
                        iconName: '../../assets/run_add.png',
                        route: ''
                    },
                    {
                        displayName: 'Plates & Runs',
                        iconName: '../../assets/run_review.png',
                        route: ''
                    },
                    {
                        displayName: 'Results',
                        iconName: '../../assets/tv_chart_review.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Products',
                context: 'product',
                iconName: '../../assets/basket.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Order Products',
                        context: 'newProductOrder',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Products',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Admin',
                iconName: '../../assets/group.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Billing',
                        iconName: '../../assets/money.png',
                        route: [{outlets: {'modal': 'NewBillingAccountModal'}}]
                    },
                    {
                        displayName: 'Users & Groups',
                        iconName: '../../assets/group.png',
                        route: '/UsersGroups'
                    },
                    {
                        displayName: 'Send email to all GNomEx users',
                        iconName: '../../assets/email_go.png',
                        route: [{outlets: {modal: ['EmailAll']}}]
                    }
                ]
            },
            {
                displayName: 'Configure',
                iconName: '../../assets/page_white_wrench.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: '../../assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: '../../assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Billing Account Fields',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    }

                ]
            },
            {
                displayName: 'Reports',
                iconName: '../../assets/page.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ]

        // Billing admin menu
        this.billingAdminNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                route: ''
            },
            {
                displayName: 'Products',
                class: 'top-menu-item',
                context: 'products',
                iconName: '../../assets/basket.png',
                children: [
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: '../../assets/money.png',
                route: ''
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'New Billing Account',
                class: 'top-menu-item',
                iconName: '../../assets/money.png',
                route: ''
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ]

        // Billing admin submitter menu
        this.billingAdminSubmitterNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'New Experiment Order',
                        iconName: '../../assets/flask.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Products',
                class: 'top-menu-item',
                context: 'product',
                iconName: '../../assets/basket.png',
                children: [
                    {
                        displayName: 'Order Products',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Orders',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                    {
                        displayName: 'Product Ledger',
                        iconName: '../../assets/review.png',
                        route: ''
                    },
                ]
            },
            {
                displayName: 'Billing',
                class: 'top-menu-item',
                iconName: '../../assets/money.png',
                route: ''
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'New Billing Account',
                class: 'top-menu-item',
                iconName: '../../assets/money.png',
                route: ''
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ]

        // Billing admin External menu
        this.billingAdminESNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiments and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    },
                    {
                        displayName: 'Bulk Sample Sheet Import',
                        iconName: '../../assets/review.png',
                        route: '/experiments-orders',
                    }
                ]
            },
            {
                displayName: 'Analysis',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },
            {
                displayName: 'Data Tracks',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                context: 'bioinformatics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Users & Groups',
                class: 'top-menu-item',
                iconName: '../../assets/group.png',
                route: '/UsersGroups'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Add/Edit Dictionaries',
                        iconName: '../../assets/book.png',
                        route: '/browse-dictionary'
                    },
                    {
                        displayName: 'Configure Core Facilities',
                        iconName: '../../assets/page_white_wrench.png',
                        route: './configure-core-facility'
                    },
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Experiment Platform',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Microarray Catalog',
                        iconName: '../../assets/image.png',
                        route: ''
                    },
                    {
                        displayName: 'Manage Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ]

        // User external menu
        this.userESNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
                children: [
                    {
                        displayName: 'Browse Experiments',
                        iconName: '../../assets/flask.png',
                        route: '/experiments',
                    },
                    {
                        displayName: 'Create New Experiment and Upload Files',
                        context: 'newExperimentOrder',
                        iconName: '../../assets/flask.png',
                        route: ''
                    },
                    {
                        displayName: 'New Project',
                        iconName: '../../assets/folder_add.png',
                        route: [{outlets: {modal: ['newProject']}}]
                    }
                ]
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
            },
            {
                displayName: 'Configure',
                class: 'top-menu-item',
                iconName: '../../assets/page_white_wrench.png',
                children: [
                    {
                        displayName: 'Configure Annotations',
                        iconName: '../../assets/page_white_wrench.png',
                        route: '/configure-annotations'
                    },
                    {
                        displayName: 'Configure Organisms and Genome Builds',
                        iconName: '../../assets/page_white_wrench.png',
                        route: ''
                    },
                    {
                        displayName: 'Protocols',
                        iconName: '../../assets/brick.png',
                        route: ''
                    }
                ]
            },
            {
                displayName: 'Reports',
                class: 'top-menu-item',
                iconName: '../../assets/page.png',
                children: [
                    {
                        displayName: 'Track Usage',
                        iconName: '../../assets/chart_bar.png',
                        route: '/TrackUsage'
                    },
                    {
                        displayName: 'Annotation Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationReport'
                    },
                    {
                        displayName: 'Annotation Progress Report',
                        iconName: '../../assets/page.png',
                        route: '/AnnotationProgressReport'
                    },
                    {
                        displayName: 'Project/Experiment Report',
                        iconName: '../../assets/flask.png',
                        route: '/ProjectExperimentReport'
                    }
                ]
            }

        ]
        this.userNonSubmitterNavItems = [
            {
                displayName: 'Experiments',
                iconName: '../../assets/flask.png',
                class: 'top-menu-item',
            },
            {
                displayName: 'Analysis',
                class: 'top-menu-item',
                iconName: '../../assets/map.png',
                route: '/analysis'
            },

            {
                displayName: 'Data Tracks',
                class: 'top-menu-item',
                iconName: '../../assets/datatrack.png',
                route: '/datatracks'
            },
            {
                displayName: 'Topics',
                class: 'top-menu-item',
                iconName: '../../assets/topic_tag.png',
                route: '/topics'
    }
        ]

    }
    /**
     * Search by number.
     */
    public searchNumber() {
        //  TODO Implement search by number
        console.log(this.objNumber);
    }

    /**
     * Search by text
     */
    public searchByText() {
        //  TODO Implement search text
        console.log(this.searchText);
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
    /**
     * Create a new menu item.
     * @param {string} displayName
     * @param {string} context
     * @param {string} icon
     * @param {string} route
     * @param {string} idCoreFacility
     * @param {any[]} children
     * @returns {Object} The new menu item.
     */
    createMenuItem(displayName: string, context: string, icon: string, route: string, idCoreFacility: string, children: any[]): object {

        let obj = {
            displayName: displayName,
            context: context,
            iconName: icon,
            children: children
        }
        return obj;
    }

    createLinkMenuItem(displayName: string, context: string, icon: string, route: string, idCoreFacility: string, children: any[]): object {
        let indx = displayName.indexOf(' ');
        let startRoute: string = "";
        if (indx === -1) {
            startRoute = displayName;
        } else {
            startRoute = displayName.substring(0, displayName.indexOf(' '));
        }
        let obj = {
            displayName: displayName,
            context: context,
            iconName: icon,
            route: '/' + startRoute,
            children: children
        }
        this.router.config.push(new ExternalRoute(startRoute, route))
        return obj;
    }

    createModalMenuItem(displayName: string, context: string, icon: string, route: any, idCoreFacility: string, children: any[]): object {
        let obj = {
            displayName: displayName,
            context: context,
            iconName: icon,
            route: route,
            children: children
        }
        return obj;
    }

    rebuildFAQMenu() {
        this.launchPropertiesService.getFAQ().subscribe((response: any[]) => {
            this.faqList = response;
            this.addQuickLinks();
        });
    }

    /**
     * Build the quick links menu items.
     */
    addQuickLinks():void {
        for (let lni of this.linkNavItems) {
            if (lni.displayName === "Links") {
                lni.children = [];
                let lniCtr = 0;
                for (let item of this.faqList) {
                    let menuItem = this.createLinkMenuItem(item.title, "", "", item.url, "", []);
                    lni.children[lniCtr] = menuItem;
                    lniCtr++;
                }
                if (this.isAdminState) {
                    let manageMenuItem = this.createModalMenuItem("Manage...", "", "", [{outlets: {modal: ['manageLinks']}}], "", []);
                    lni.children[lniCtr] = manageMenuItem;
                    lniCtr++;
                }
                break;
            }
            // if (lni && lni.children.length === 0) {
            //     this.hideMenusByContext(this.linkNavItems, 'quickLinks')
            // }
        }
    }

    /**
     * Hides menu items base on context value.
     * @param {any[]} navMenu
     * @param {string} context
     */
    hideMenusByContext(navMenu:any[], context:string):void {
        let menuItemCtr = 0;
        for (let menuItem of navMenu) {

            if (menuItem.context === context) {
                navMenu[menuItemCtr].hidden = true;
                navMenu[menuItemCtr].class = 'header-flex0';
                menuItemCtr++;
            }
            if (menuItem.children) {
                this.hideMenusByContext(menuItem.children, context);
            }
        }
    }

    /**
     * Determine if user is in a lab that can submit requests.
     * @returns {boolean}
     */
    canSubmitRequestForALab():boolean {
        let hasLab:boolean = false;
        for (let lab of this.labList) {
            if (lab.canSubmitRequests === 'Y') {
                hasLab = true;
                break;
            }
        }
        return hasLab;
    }

    /**
     * Add menu items with context of newExperimentOrder.
     * @param {any[]} navMenu
     */
    addNewExperimentMenus(navMenu:any[]):void {
        if (this.gnomexService.myCoreFacilities != null && this.gnomexService.myCoreFacilities.length > 1) {
            for (let i: number = 0; i < navMenu.length; i++) {
                let children = [];
                if (navMenu[i].context === "newExperimentOrder") {
                    navMenu[i].children = this.addCoreNewExperiments(navMenu[i], children);
                }
                if (navMenu[i].children)
                    this.addNewExperimentMenus(navMenu[i].children);
            }
        }
    }

    /**
     * Only add if core has request categories.
     * @param template
     * @param {any[]} children
     * @returns {any[]}
     */
    addCoreNewExperiments(template:any, children: any[]): any[] {
        let coreCtr: number = 0;

        for (let core of this.gnomexService.myCoreFacilities) {
            if (core.hasRequestCategories === 'Y') {
                let label: string = template.displayName + " for " + core.facilityName;
                let menuItem = this.createMenuItem(label, "", template.iconName, "", core.idCoreFacility,[]);
                children[coreCtr] = menuItem;
                coreCtr++;
            }
        }

        return children;
    }

    /**
     * Add menu items with context of newProductOrder.
     *
     * @param {any[]} navMenu
     */
    addProductOrderMenus(navMenu: any[]):void {
        if (this.gnomexService.myCoreFacilities != null && this.gnomexService.myCoreFacilities.length > 1) {
            for (let i: number = 0; i < navMenu.length; i++) {
                let children: any[] = [];
                if (navMenu[i].context === "newProductOrder") {
                    navMenu[i].children = this.addCoreNewProducts(navMenu[i], children);
                }
                if (navMenu[i].children)
                    this.addProductOrderMenus(navMenu[i].children);
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
    addCoreNewProducts(template: any, children: any[]): any[] {
        let coreCtr: number = 0;

        for (let core  of this.gnomexService.myCoreFacilities) {
            for (let pt of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.ProductType")) {
                if (pt.idCoreFacility == core.idCoreFacility) {
                    // TODO Need to put route info on core facility
                    let label: string = template.displayName + " for " + core.facilityName;
                    let menuItem = this.createMenuItem(label, "", template.iconName, "", core.idCoreFacility,  []);
                    children[coreCtr] = menuItem;
                    coreCtr++;
                    break;
                }
            }
        }
        return children;
    }

    /**
     * Hide menu items by property
     * @param {any[]} navMenu
     */
    hideMenusByProperties(navMenu: any[]):void {
        let showMenus: any[] = [];
        let hideMenus: any[] = [];
        for (let property of this.dictionaryService.getEntries("hci.gnomex.model.PropertyDictionary")) {
            if (property.value === '') {
                continue;
            }
            if (property.propertyName.indexOf("menu_") === 0) {
                var menuToHideShow: string = "";
                if (property.propertyValue == "hide" || property.propertyValue == "show") {
                    if (property.idCoreFacility != "" && !this.createSecurityAdvisorService.isSuperAdmin) {
                        if (this.createSecurityAdvisorService.coreFacilitiesICanManage.length > 0) {
                            // Only hide a menu for a core facility admin when
                            // the menu_ property matches the core facility
                            // the admin manages.
                            for (let cf of this.createSecurityAdvisorService.coreFacilitiesICanManage) {
                                if (property.idCoreFacility === cf.idCoreFacility) {
                                    menuToHideShow = property.propertyName.substr(5);
                                    break;
                                }
                            }
                        } else {

                            if (menuToHideShow === "") {
                                // Only hide a menu when the menu_ property matches the
                                // core facility and the user is only associated with ONE
                                // core facility
                                if (this.gnomexService.myCoreFacilities.length < 2) {
                                    for  (let cf1 of  this.gnomexService.myCoreFacilities) {
                                        if (property.idCoreFacility === cf1.idCoreFacility) {
                                            menuToHideShow = property.propertyName.substr(5);
                                            break;
                                        }
                                    }
                                }

                            }
                        }
                    } else if (property.idCoreFacility === "") {
                        menuToHideShow = property.propertyName.substr(5);
                    }
                } else if (property.propertyValue === "hide super" && this.createSecurityAdvisorService.isSuperAdmin) {
                    menuToHideShow = property.propertyName.substr(5);
                }
            }
            if (menuToHideShow != "") {
                if (property.propertyValue === "hide" || property.propertyValue === "hide super") {
                    hideMenus.push(menuToHideShow);
                } else if (property.propertyValue === "show") {
                    showMenus.push(menuToHideShow);
                }
            }
        }
        for (let key of hideMenus) {
            if (showMenus.indexOf(key) === -1 ) {
                for (let i: number = 0; i < navMenu.length; i++) {
                    if (navMenu[i].displayName === key) {
                        navMenu[i].hidden = true;
                        navMenu[i].class = 'header-flex0';
                        break;
                    } else {
                        let cn: any[] = navMenu[i].children;
                        if (cn) {
                            for (let j: number = 0; j < cn.length; j++) {
                                if (cn[j].displayName === key) {
                                    cn[j].hidden = true;
                                    cn[j].class = 'header-flex0';
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Hide menu items matching context
     * @param {any[]} navMenu
     */
    customizeMenus(navMenu: any[]):void {
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

        // TODO Handle guestMode
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
            } else if (this.createSecurityAdvisorService.isBillingAdmin){
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
        } else if ((this.gnomexService.hasPermission("canSubmitRequests") && this.canSubmitRequestForALab()) ||
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
        }

        // Hide help edit unless admin
        if (!this.isAdminState) {
            this.hideMenusByContext(this.linkNavItems, 'helpEdit');
        }

        if (this.createSecurityAdvisorService.isGuest) {
            this.hideMenusByContext(this.linkNavItems, 'quickLinks');
        }

        this.addNewExperimentMenus(this.navItems);
        this.addProductOrderMenus(this.navItems);
        this.hideMenusByProperties(this.navItems);
    }

}
