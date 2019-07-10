import {Component, OnDestroy, OnInit, QueryList, Type, ViewChildren} from "@angular/core";
import {NewExternalExperimentService} from "../../services/new-external-experiment.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {Router} from "@angular/router";
import {Experiment} from "../../util/models/experiment.model";
import {ExperimentsService} from "../experiments.service";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {forkJoin, Observable, Subscription} from "rxjs";
import {UtilService} from "../../services/util.service";
import {TabExternalDescriptionComponent} from "./tab-external-description.component";
import {TabExternalSetupComponent} from "./tab-external-setup.component";
import {TabAnnotationViewComponent} from "./tab-annotation-view.component";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {TabVisibilityComponent} from "./tab-visibility.component";
import {DynamicComponent} from "ng-dynamic-component";
import {TabConfirmIlluminaComponent} from "./tab-confirm-illumina.component";
import {ConstantsService} from "../../services/constants.service";
import {TopicService} from "../../services/topic.service";

@Component({
    selector: 'new-external-experiment',
    template: `
        <div class="full-height full-width flex-container-col padded">
            <div>
                <img *ngIf="newEEService.experiment?.requestCategory" [src]="newEEService.experiment?.requestCategory.icon" class="icon">
                Upload {{newEEService.experiment?.requestCategory ? newEEService.experiment?.requestCategory.display + ' ' : ''}}experiment data from a third party facility
            </div>
            <div class="full-width flex-grow padding-light">
                <mat-tab-group class="full-height full-width" [(selectedIndex)]="selectedTabIndex" (selectedTabChange)="this.onTabChange()">
                    <mat-tab *ngFor="let tab of this.tabs; let i = index" class="full-height full-width overflow-auto" [label]="tab.label"
                             [disabled]="this.checkTabDisabled(i)">
                        <ndc-dynamic class="full-height full-width" [ndcDynamicComponent]="tab.component" [ndcDynamicInputs]="newEEService.inputs"></ndc-dynamic>
                    </mat-tab>
                </mat-tab-group>
            </div>
            <div class="full-width flex-container-row justify-space-between">
                <div class="spaced-children-margin">
                    <button mat-raised-button (click)="back()"
                            [disabled]="selectedTabIndex === 0 || this.checkTabDisabled(selectedTabIndex - 1)">
                        <mat-icon>arrow_left</mat-icon>Back
                    </button>
                    <button mat-raised-button (click)="next()"
                            [disabled]="selectedTabIndex === this.tabs.length - 1 || this.checkTabDisabled(selectedTabIndex + 1)">
                        <mat-icon>arrow_right</mat-icon>Next
                    </button>
                    <button mat-raised-button (click)="save()" [disabled]="this.newEEService.form.invalid || selectedTabIndex !== this.tabs.length - 1">
                        <img [src]="this.constantsService.ICON_SAVE" class="icon">Save
                    </button>
                </div>
                <div>
                    <button mat-raised-button (click)="promptToCancel()">Cancel</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .padding-light {
            padding: 0.5em;
        }
    `]
})

export class NewExternalExperimentComponent implements OnInit, OnDestroy {

    public selectedTabIndex: number = 0;
    public tabs: DynamicTab[] = [];
    private tabsRefArray: DynamicComponent[] = [];

    private requestCategorySubscription: Subscription;

    @ViewChildren(DynamicComponent) tabsRef: QueryList<DynamicComponent>;

    constructor(public newEEService: NewExternalExperimentService,
                public constantsService: ConstantsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private router: Router,
                private topicService: TopicService,
                private experimentService: ExperimentsService) {
    }

    ngOnInit(): void {
        this.newEEService.initialize();
        this.tabs = [
            {
                label: "Setup",
                component: TabExternalSetupComponent,
                formField: "form",
            }
        ];
        setTimeout(() => {
            this.tabsRefArray = this.tabsRef.toArray();
        });

        this.experimentService.getNewRequest().subscribe((response: any) => {
            if (!response) {
                this.dialogsService.error("Unable to create new experiment. Please contact GNomEx Support");
                return;
            }

            this.newEEService.experiment = Experiment.createExperimentObjectFromAny(this.dictionaryService, this.gnomexService, this.propertyService, this.securityAdvisor, response.Request);
            this.newEEService.experiment.isExternal = "Y";
            this.requestCategorySubscription = this.newEEService.experiment.onChange_requestCategory.subscribe(() => {
                this.refreshTabs();
                setTimeout(() => {
                    this.tabsRefArray = this.tabsRef.toArray();
                    for (let index: number = 0; index < this.tabs.length; index++) {
                        if (this.tabs[index].formField) {
                            this.newEEService.setForm(this.tabs[index].label, this.tabsRefArray[index].componentRef.instance[this.tabs[index].formField]);
                        }
                    }
                });
            });
        });
    }

    public checkTabDisabled(index: number): boolean {
        if (index > 0) {
            return this.newEEService.form.get(this.tabs[index - 1].label).invalid || this.checkTabDisabled(index - 1);
        } else {
            return false;
        }
    }

    private refreshTabs(): void {
        this.selectedTabIndex = 0;
        let newTabs: DynamicTab[] = this.tabs.slice(0, 1);
        if (this.newEEService.experiment.requestCategory) {
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

            if (this.newEEService.experiment.requestCategory.isIlluminaType === "Y") {
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

    public onTabChange(): void {
        if (this.tabsRefArray[this.selectedTabIndex].componentRef.instance.tabDisplayed) {
            this.tabsRefArray[this.selectedTabIndex].componentRef.instance.tabDisplayed();
        }
    }

    public back(): void {
        this.selectedTabIndex--;
    }

    public next(): void {
        this.selectedTabIndex++;
    }

    public save(): void {
        let sequenceLanes: any[] = [];
        for (let sample of this.newEEService.experiment.samples) {
            sequenceLanes.push(sample.createSequenceLane());
        }
        this.newEEService.experiment.sequenceLanes = sequenceLanes;

        this.experimentService.saveRequest(this.newEEService.experiment).subscribe((result: any) => {
            if (result && result.idRequest) {
                let topicsToLinkTo: any[] = this.newEEService.experiment.topics;
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
        this.dialogsService.confirm("The experiment has not been saved. Are you sure you want to quit?", "Warning").subscribe((answer: boolean) => {
            if (answer) {
                this.router.navigateByUrl('home');
            }
        });
    }

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.requestCategorySubscription);
    }

}

interface DynamicTab {
    label: string,
    component: Type<any>,
    formField: string,
}
