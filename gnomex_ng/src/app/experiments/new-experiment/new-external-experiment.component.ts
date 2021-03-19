import {Component, OnDestroy, OnInit, QueryList, Type, ViewChildren} from "@angular/core";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {DynamicComponent} from "ng-dynamic-component";

import {BehaviorSubject, forkJoin, Observable, Subscription} from "rxjs";

import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {Experiment} from "../../util/models/experiment.model";
import {ExperimentsService} from "../experiments.service";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {UtilService} from "../../services/util.service";
import {TabExternalDescriptionComponent} from "./tab-external-description.component";
import {TabExternalSetupComponent} from "./tab-external-setup.component";
import {TabAnnotationViewComponent} from "./tab-annotation-view.component";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {TabVisibilityComponent} from "./tab-visibility.component";
import {TabConfirmIlluminaComponent} from "./tab-confirm-illumina.component";
import {ConstantsService} from "../../services/constants.service";
import {TopicService} from "../../services/topic.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";


@Component({
    selector: 'new-external-experiment',
    templateUrl: "./new-external-experiment.component.html",
    styles: [``]
})
export class NewExternalExperimentComponent implements OnInit, OnDestroy {

    @ViewChildren(DynamicComponent) tabsRef: QueryList<DynamicComponent>;

    public selectedTabIndex: number = 0;
    public tabs: DynamicTab[] = [];
    private tabsRefArray: DynamicComponent[] = [];

    public inputs: any = {};

    public form: FormGroup = new FormGroup({});

    public stateChangeSubject: BehaviorSubject<string> = new BehaviorSubject<string>("NEW");

    private requestCategorySubscription: Subscription;


    private _experiment: Experiment;

    public get experiment(): Experiment {
        return this._experiment;
    }

    public set experiment(experiment: Experiment) {
        this._experiment = experiment;
        this.inputs = {
            experiment: this._experiment,
            stateChangeSubject: this.stateChangeSubject,
        };
    }

    public get disableSave(): boolean {
        return this.form.invalid || this.selectedTabIndex !== this.tabs.length - 1;
    }

    public get showSaveButton(): boolean {
        return !this.disableSave;
    }


    constructor(public constantsService: ConstantsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private router: Router,
                private topicService: TopicService,
                private experimentService: ExperimentsService) { }

    ngOnInit(): void {
        this.experiment = null;
        this.inputs = {};

        this.form = new FormGroup({
            "Setup": new FormGroup({}),
            "Description": new FormGroup({}),
            "Annotations": new FormGroup({}),
            "Samples": new FormGroup({}),
            "Visibility": new FormGroup({}),
            "Confirm": new FormGroup({}),
        });

        this.tabs = [{
            label: "Setup",
            component: TabExternalSetupComponent,
            formField: "form",
        }];

        setTimeout(() => {

            this.tabsRefArray = this.tabsRef.toArray();

            this.dialogsService.startDefaultSpinnerDialog();

            this.experimentService.getNewRequest().subscribe((response: any) => {
                if (!response) {
                    this.dialogsService.error("Unable to create new experiment. Please contact GNomEx Support");
                    return;
                }

                this.experiment = Experiment.createExperimentObjectFromAny(this.dictionaryService, this.gnomexService, this.propertyService, this.securityAdvisor, response.Request);
                this.experiment.isExternal = "Y";

                this.requestCategorySubscription = this.experiment.onChange_requestCategory.subscribe(() => {
                    this.refreshTabs();
                    setTimeout(() => {
                        this.tabsRefArray = this.tabsRef.toArray();
                        for (let index: number = 0; index < this.tabs.length; index++) {
                            if (this.tabs[index].formField) {
                                this.form.setControl(this.tabs[index].label, this.tabsRefArray[index].componentRef.instance[this.tabs[index].formField]);
                            }
                        }
                    });
                });

                this.dialogsService.stopAllSpinnerDialogs();
            }, (err: IGnomexErrorResponse) => {
                console.error(err);
                this.dialogsService.stopAllSpinnerDialogs();
            });
        });


    }

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.requestCategorySubscription);
    }


    public checkTabDisabled(index: number): boolean {
        if (index > 0) {
            return this.form.get(this.tabs[index - 1].label).invalid || this.checkTabDisabled(index - 1);
        } else {
            return false;
        }
    }

    private refreshTabs(): void {
        this.selectedTabIndex = 0;
        let newTabs: DynamicTab[] = this.tabs.slice(0, 1);

        if (this.experiment.requestCategory) {
            let descriptionTab: DynamicTab = {
                label: "Description",
                component: TabExternalDescriptionComponent,
                formField: "form",
            };
            let annotationsTab: DynamicTab = {
                label: "Annotations",
                component: TabAnnotationViewComponent,
                formField: "form",
            };
            let samplesIlluminaTab: DynamicTab = {
                label: "Samples",
                component: TabSamplesIlluminaComponent,
                formField: "form",
            };
            let visibilityTab: DynamicTab = {
                label: "Visibility",
                component: TabVisibilityComponent,
                formField: "visibilityForm",
            };
            let confirmIlluminaTab: DynamicTab = {
                label: "Confirm",
                component: TabConfirmIlluminaComponent,
                formField: "form",
            };

            if (this.experiment.requestCategory.isIlluminaType === "Y") {
                newTabs.push(...[
                    descriptionTab,
                    annotationsTab,
                    samplesIlluminaTab,
                    visibilityTab,
                    confirmIlluminaTab,
                ]);
            }
        }

        this.tabs = newTabs;
    }

    public save(): void {
        let sequenceLanes: any[] = [];
        for (let sample of this.experiment.samples) {
            sequenceLanes.push(sample.createSequenceLane());
        }
        this.experiment.sequenceLanes = sequenceLanes;

        this.experimentService.saveRequest(this.experiment).subscribe((result: any) => {
            if (result && result.idRequest) {
                let topicsToLinkTo: any[] = this.experiment.topics;
                if (topicsToLinkTo && topicsToLinkTo.length > 0) {
                    let linkingCalls: Observable<any>[] = [];
                    for (let topic of topicsToLinkTo) {
                        linkingCalls.push(this.topicService.addItemToTopicNew(topic.idTopic, "idRequest0", result.idRequest));
                    }
                    forkJoin(linkingCalls).subscribe(() => {
                        this.saveFinished(result.requestNumber);
                    });
                } else {
                    this.saveFinished(result.requestNumber);
                }
            }
        });
    }

    private saveFinished(requestNumber: string): void {
        this.dialogsService.alert("Experiment #" + requestNumber + " has been added to the GNomEx repository", "Experiment Saved", DialogType.SUCCESS);
        this.gnomexService.navByNumber(requestNumber);
    }

    public promptToCancel(): void {
        this.dialogsService.confirm("The experiment has not been saved. Are you sure you want to quit?", "Cancel").subscribe((answer: boolean) => {
            if (answer) {
                this.router.navigateByUrl('home');
            }
        });
    }


    public next(): void {
        this.selectedTabIndex++;
    }

    public back(): void {
        this.selectedTabIndex--;
    }

    public onTabChange(): void {
        if (this.tabsRefArray[this.selectedTabIndex].componentRef.instance.tabDisplayed) {
            this.tabsRefArray[this.selectedTabIndex].componentRef.instance.tabDisplayed();
        }
    }
}

interface DynamicTab {
    label: string,
    component: Type<any>,
    formField: string,
}
