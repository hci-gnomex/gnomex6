import {
    Component,
    ComponentRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {FormGroup} from "@angular/forms";

import {BehaviorSubject, Subscription} from "rxjs";
import {first} from "rxjs/internal/operators";

import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {ExperimentBioinformaticsTabComponent} from "../experiment-detail/experiment-bioinformatics-tab.component";
import {ExperimentsService} from "../experiments.service";
import {GnomexService} from "../../services/gnomex.service";
import {NewExperimentSetupComponent} from "./new-experiment-setup.component";
import {PropertyService} from "../../services/property.service";
import {TabAnnotationViewComponent} from "./tab-annotation-view.component";
import {TabConfirmIlluminaComponent} from "./tab-confirm-illumina.component";
import {TabSampleSetupViewComponent} from "./tab-sample-setup-view.component";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {TabSeqProtoViewComponent} from "./tab-seq-proto-view.component";
import {TabSeqSetupViewComponent} from "./tab-seq-setup-view.component";
import {TabVisibilityComponent} from "./tab-visibility.component";

import {Experiment} from "../../util/models/experiment.model";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'new-experiment',
    templateUrl: "./new-experiment.component.html",
    styles: [`
        
        .bordered { border: 1px solid silver; }
        
        .highlight-agreement {
            color: green;
            font-style: italic;
        }
        
        .padded-right-large { padding-right: 1em; }

    `]

})

export class NewExperimentComponent implements OnDestroy, OnInit {
    @ViewChild("setupTab") setupTab: NewExperimentSetupComponent;

    @Output() properties = new EventEmitter<any[]>();

    types = OrderType;

    public submitOrSaveButtonLabel: string = "Submit";

    public tabs: any[];
    public selectedIndex: number = 0;
    public currentTabComponent: any;

    private coreFacility: any;
    private sub: any;

    public icon: any;
    public label: string = "New Experiment Order for ";

    private annotations: any;
    private visibilityDetailObj: TabVisibilityComponent;

    // public disableSubmit: boolean = true;

    private navigationSubscription: Subscription;

    public inputs = {
        lab: null,
        requestCategory: null,
        idCoreFacility: '',
        organism_current: {
            idOrganism: '',
            organism: ''
        },
        experimentAnnotations: new BehaviorSubject<any[]>([]),
        getExperimentAnnotationsSubject: new BehaviorSubject<any>({}),
        agreeCheckboxLabelSubject: new BehaviorSubject<string>(''),
        QCChipPriceListSubject: new BehaviorSubject<string>(''),
        experiment: {
            idCoreFacility: '',
            PropertyEntries: [],
            billingItems: [],
            codeRequestCategory: '',
            requestCategory: {
                display: '',
                isIlluminaType: '',
                type: ''
            },
            RequestProperties: [],
            applicationNotes: '',
            codeApplication: '',
            codeIsolationPrepType: '',
            coreToExtractDNA: '',
            includeBisulfideConversion: '',
            invoicePrice: '',
            includeQubitConcentration: ''
        }
    };

    outputs = {
        navigate: (type) => {
            if (type === '+') {
                this.goNext();
            } else {
                this.goBack();
            }
        },
        onChangeRequestCategory: (value: any) => {
            if (value) {
                this.icon = value.icon;
            }

            if (this.inputs.experiment.requestCategory) {
                this.label = "New " + this.inputs.experiment.requestCategory.display + " Experiment for " + this.coreFacility.display;
            }

            let idCoreFacility: string = '';
            let codeRequestCategory: string = '';

            if (this.inputs && this.inputs.idCoreFacility) {
                idCoreFacility = this.inputs.idCoreFacility
            }
            if (this.inputs && this.inputs.experiment && this.inputs.experiment.codeRequestCategory) {
                codeRequestCategory = this.inputs.experiment.codeRequestCategory;
            }

            let property = this.propertyService.getProperty("new_request_save_before_submit", idCoreFacility, codeRequestCategory);
            this.submitOrSaveButtonLabel = "Submit";

            if (property && property.propertyValue && property.propertyValue === "Y") {
                this.submitOrSaveButtonLabel = "Save";
            }

            this.showTabs();
        }
    };
    annotationInputs = {
        annotations: this.annotations,
        orderType: this.types.EXPERIMENT,
        experimentAnnotations: this.inputs.experimentAnnotations,
        getExperimentAnnotationsSubject: this.inputs.getExperimentAnnotationsSubject,
        showConfigureAnnotationsButton: false,
        disabled: false
    };

    public agreeCheckboxLabel: string = '';

    public firstInclusion: boolean = true;

    public get formOfCurrentlySelectedTab(): FormGroup {
        if (!this.selectedIndex && this.selectedIndex !== 0) {
            return null;
        }

        if (this.selectedIndex === 0) {
            return this.setupTab.form;
        } else if (this.tabs
            && Array.isArray(this.tabs)
            && this.selectedIndex > 0
            && this.selectedIndex <= this.tabs.length) {
            if (!this.tabs[this.selectedIndex - 1] || !this.tabs[this.selectedIndex - 1].component) {
                return null;
            } else {
                return this.tabs[this.selectedIndex - 1].instance.form;
            }
        } else {
            return null;
        }
    }

    public get index_firstInvalidTab(): number {
        if (!this.setupTab || !this.setupTab.form) {
            return -1;
        }
        if (this.setupTab.form.invalid) {
            return 0;
        }

        let i: number = 1;
        for (let tab of this.tabs) {
            if (!tab.instance || !tab.instance.form || tab.instance.form.invalid) {
                return i;
            }
            i++;
        }

        return i; // if all valid returns higher index than in the grid (by one)
    }

    public get onSubmitTab(): boolean {
        // Assume the submit tab is always the last tab.
        return this.tabs && Array.isArray(this.tabs) && this.selectedIndex === this.tabs.length;
    }


    constructor(private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private router: Router,
                private gnomexService: GnomexService,
                private newExperimentService: NewExperimentService,
                private experimentService: ExperimentsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,) {
        this.navigationSubscription = this.router.events.subscribe((e: any) => {
            // If it is a NavigationEnd event re-initialize the component
            if (e instanceof NavigationEnd) {
                this.reinitialize();
            }
        });
    }

    reinitialize(): void {
        // should probably tell all tabs to clear their data!
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe((params: any) => {

            this.currentTabComponent = null;

            if (params && params.idCoreFacility) {
                this.inputs.idCoreFacility = params.idCoreFacility;

                this.coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', params.idCoreFacility);

                if (!!this.coreFacility) {
                    this.label = "New Experiment for " + this.coreFacility.display;
                }

                setTimeout(() => {
                    this.dialogService.startDefaultSpinnerDialog();
                });

                this.experimentService.getNewRequest().pipe(first()).subscribe((response: any) => {
                    if (!response) {
                        return;
                    }

                    this.dialogService.stopAllSpinnerDialogs();

                    let experiment: Experiment = Experiment.createExperimentObjectFromAny(this.dictionaryService, this.gnomexService, this.propertyService, this.securityAdvisor, response.Request);
                    experiment.idCoreFacility = this.inputs.idCoreFacility;

                    this.annotations = experiment.RequestProperties.filter((annotation: any) => {
                        return annotation
                            && annotation.isActive === 'Y'
                            && annotation.idCoreFacility === params.idCoreFacility;
                    });

                    // TODO: figure out why this is not pulling all the different records - it's causing failures.
                    let annotationsOnlyAllowedForRequestCategories: any = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PROPERTY_PLATFORM_APPLICATION_DICTIONARY);

                    this.annotationInputs.annotations = this.annotations;

                    experiment.onChange_codeRequestCategory.subscribe((codeRequestCategory: string) => {
                        this.annotationInputs.annotations = [];
                        this.annotationInputs.annotations = this.annotations.filter((a:any) => {
                            let result: boolean = true;

                            for (let annotation of annotationsOnlyAllowedForRequestCategories) {
                                if (annotation.idProperty === a.idProperty) {
                                    result = false;

                                    if (annotation.codeRequestCategory === codeRequestCategory) {
                                        result = true;
                                        break;
                                    }
                                }
                            }

                            return result;
                        });
                    });

                    this.inputs.experiment = experiment;
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });
            }
        });

        this.inputs.agreeCheckboxLabelSubject.subscribe((value: string) => {
            if (value) {
                this.agreeCheckboxLabel = value;
            } else {
                this.agreeCheckboxLabel = '';
            }
        });
    }

    ngOnDestroy() {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }


    showTabs() {
        this.tabs = [];

        let category = this.inputs.experiment.requestCategory;
        this.inputs.requestCategory = category;

        if (!this.inputs.experiment) {
            return;
        }

        this.inputs.experiment.applicationNotes = '';
        this.inputs.experiment.codeApplication = '';
        this.inputs.experiment.codeIsolationPrepType = '';
        this.inputs.experiment.coreToExtractDNA = 'N';
        this.inputs.experiment.includeBisulfideConversion = 'N';
        this.inputs.experiment.includeQubitConcentration = 'N';

        if (category.isIlluminaType === 'Y') {
            this.gnomexService.submitInternalExperiment()
                ? this.newExperimentService.currentState = 'SolexaBaseState'
                : this.newExperimentService.currentState = 'SolexaBaseExternalState';


            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });

            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }

            let libPrepTab = {
                label: "Library Prep",
                disabled: true,
                component: TabSeqSetupViewComponent
            };
            let seqProtoTab = {
                label: "Sequencing Options",
                disabled: true,
                component: TabSeqProtoViewComponent
            };
            let annotationsTab = {
                label: "Annotations",
                disabled: true,
                component: TabAnnotationViewComponent
            };
            let samplesTab = {
                label: "Experiment Design",
                disabled: true,
                component: TabSamplesIlluminaComponent
            };
            let visibilityTab = {
                label: "Visibility",
                disabled: true,
                component: TabVisibilityComponent
            };
            let bioTab = {
                label: "Bioinformatics",
                disabled: true,
                component: ExperimentBioinformaticsTabComponent
            };
            let confirmTab = {
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            };

            // this.tabs.push(sampleSetupTab);
            // this.tabs.push(propertyTab);
            this.tabs.push(libPrepTab);
            this.tabs.push(seqProtoTab);
            this.tabs.push(annotationsTab);
            this.tabs.push(samplesTab);
            this.tabs.push(visibilityTab);
            this.tabs.push(bioTab);
            this.tabs.push(confirmTab);
        } else if (category.type === NewExperimentService.TYPE_QC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState = 'QCState' :
                this.newExperimentService.currentState = 'QCExternalState';

            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });

            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }

            this.tabs.push({
                label: "Samples",
                disabled: true,
                component: TabSamplesIlluminaComponent
            });
            this.tabs.push({
                label: "Visibility",
                disabled: true,
                component: TabVisibilityComponent
            });
            this.tabs.push({
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            });
        } else if (category.type === NewExperimentService.TYPE_GENERIC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState = 'GenericState' :
                this.newExperimentService.currentState = 'GenericExternalState';

            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });
            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }
            this.tabs.push({
                label: "Samples",
                disabled: true,
                component: TabSamplesIlluminaComponent
            });
            this.tabs.push({
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            });
        } else if (category.type === NewExperimentService.TYPE_CAP_SEQ) {
            this.newExperimentService.currentState = "CapSeqState";
        } else if (category.type === NewExperimentService.TYPE_FRAG_ANAL) {
            this.newExperimentService.currentState = "FragAnalState";
        } else if (category.type === NewExperimentService.TYPE_MIT_SEQ) {
            this.newExperimentService.currentState = "MitSeqState";
        } else if (category.type === NewExperimentService.TYPE_CHERRY_PICK) {
            this.newExperimentService.currentState = "CherryPickState";
        } else if (category.type === NewExperimentService.TYPE_ISCAN) {
            this.newExperimentService.currentState = "IScanState";
        } else if (category.type === NewExperimentService.TYPE_SEQUENOM) {
            this.newExperimentService.currentState = "SequenomState";

            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });
            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length > 0) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }
            this.tabs.push({
                label: "Annotations",
                disabled: true,
                component: TabAnnotationViewComponent
            });
            this.tabs.push({
                label: "Samples",
                disabled: true,
                component: TabSamplesIlluminaComponent
            });
            this.tabs.push({
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            });
        } else if (category.type === NewExperimentService.TYPE_ISOLATION) {
            this.newExperimentService.currentState = "IsolationState";

            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });
            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }
            this.tabs.push({
                label: "Annotations",
                disabled: true,
                component: TabAnnotationViewComponent
            });
            this.tabs.push({
                label: "Samples",
                disabled: true,
                component: TabSamplesIlluminaComponent
            });
            this.tabs.push({
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            });
        } else if (category.type === NewExperimentService.TYPE_NANOSTRING) {
            this.newExperimentService.currentState = "NanoStringState";


            this.tabs.push({
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            });

            if (this.annotationInputs
                && this.annotationInputs.annotations
                && Array.isArray(this.annotationInputs.annotations)
                && this.annotationInputs.annotations.length) {

                this.tabs.push({
                    label: "Other Details",
                    disabled: true,
                    component: AnnotationTabComponent
                });
            }

            this.tabs.push({
                label: "Assay Type",
                disabled: true,
                component: TabSeqSetupViewComponent
            });
            // this.tabs.push({
            //     label: "Sequencing Options",
            //     disabled: true,
            //     component: TabSeqProtoViewComponent
            // });
            this.tabs.push({
                label: "Annotations",
                disabled: true,
                component: TabAnnotationViewComponent
            });
            this.tabs.push({
                label: "Experiment Design",
                disabled: true,
                component: TabSamplesIlluminaComponent
            });
            this.tabs.push({
                label: "Visibility",
                disabled: true,
                component: TabVisibilityComponent
            });
            this.tabs.push({
                label: "Bioinformatics",
                disabled: true,
                component: ExperimentBioinformaticsTabComponent
            });
            this.tabs.push({
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            });

        } else if (category.type === NewExperimentService.TYPE_CLINICAL_SEQUENOM) {
            this.newExperimentService.currentState = "ClinicalSequenomState";
        } else if (category.type === NewExperimentService.TYPE_MICROARRAY) {
            this.gnomexService.submitInternalExperiment()
                ? this.newExperimentService.currentState = 'MicroarrayState'
                : this.newExperimentService.currentState = 'MicroarrayExternalState';
        }
    }

    onTabChange(event) {
        this.selectedIndex = event.index;

        if (this.tabs
            && event
            && event.index
            && event.index > 0
            && event.index <= this.tabs.length
            && this.tabs[event.index - 1]
            && this.tabs[event.index - 1].instance
            && typeof this.tabs[event.index - 1].instance.tabDisplayed === 'function') {
            // this is important for validating the experiment's samples, where changes were made off of the samples grid tab.
            this.tabs[event.index - 1].instance.tabDisplayed();
        }
    }

    goBack() {
        this.selectedIndex--;
        this.currentTabComponent = this.newExperimentService.components[this.selectedIndex]
    }

    goNext() {
        switch (this.newExperimentService.currentState) {
            case 'SolexaBaseState' : {
                if (this.selectedIndex === 0) {
                    this.tabs[0].disabled = false;
                    this.tabs[1].disabled = false;
                } else if (this.selectedIndex > 1 && this.selectedIndex < this.tabs.length - 1) {
                    this.tabs[this.selectedIndex + 1].disabled = false;
                } else {
                    // The submit tab is the next one - Do nothing.
                }
            } break;
            case 'QCState' : {
                if (this.selectedIndex === 0) {
                    this.tabs[0].disabled = false;
                }
            }

        }

        this.selectedIndex++;
        this.currentTabComponent = this.newExperimentService.components[this.selectedIndex];
    }


    componentCreated(compRef: ComponentRef<any>) {
        if (compRef) {
            this.newExperimentService.components.push(compRef.instance);

            if (compRef.instance instanceof TabVisibilityComponent) {
                this.visibilityDetailObj = compRef.instance as TabVisibilityComponent;
            }

            for (let tab of this.tabs) {
                if (compRef.instance instanceof tab.component) {
                    tab.instance = compRef.instance;
                }
            }
        }
    }

    public onChangeLab(event: any): void {
        this.inputs.lab = event;
    }


    public SaveNewExperiment(): void {
        this.dialogService.startDefaultSpinnerDialog();

        // Billing items should not be sent to the backend (though they should be ignored by the RequestParser),
        // but are used to create Price Quotes on the confirm tab in the new experiment
        this.inputs.experiment.billingItems = [];

        this.experimentService.saveRequest(this.inputs.experiment).subscribe((response) => {
            this.dialogService.stopAllSpinnerDialogs();

            if (!response) {
                // error
                return;
            }

            if (response.requestNumber && this.coreFacility.display) {
                let submissionMessage = 'Request #  ' + response.requestNumber + '\n'
                    + 'Experiment has been submitted.  Please print off the request form and deliver it along with your samples to the ' + this.coreFacility.display + '.\n'
                    + '\n'
                    + 'Please inscribe database ID numbers on the lids of 1.5 ml microcentrifuge tubes.  Inscribe sample names on the sides of tubes. ';

                let temp = this.dialogService.alert(submissionMessage, "Request Submitted", DialogType.SUCCESS).subscribe((value: boolean) => {
                    if (response.requestNumber) {
                        window.open('ShowRequestForm.gx?idRequest=' + response.idRequest, '_blank');

                        this.gnomexService.navByNumber(response.requestNumber);
                    } else {
                        // Should not be reachable...
                    }

                    temp.unsubscribe();
                });
            }
        }, (err:IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });
    }


    public clickCancel(): void {
        this.dialogService.confirm("The experiment has not been saved. Are you sure you want to quit?", "Cancel").subscribe((answer: boolean) => {
            if (answer) {
                this.router.navigateByUrl('home');
            }
        });
    }

}

