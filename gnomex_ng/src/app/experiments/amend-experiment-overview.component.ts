import {Component, OnDestroy, OnInit, QueryList, Type, ViewChildren} from "@angular/core";
import {DynamicComponent} from "ng-dynamic-component";
import {Subscription} from "rxjs";
import {AmendExperimentService} from "../services/amend-experiment.service";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {Router} from "@angular/router";
import {ExperimentsService} from "./experiments.service";
import {TabAnnotationViewComponent} from "./new-experiment/tab-annotation-view.component";
import {TabSamplesIlluminaComponent} from "./new-experiment/tab-samples-illumina.component";
import {TabVisibilityComponent} from "./new-experiment/tab-visibility.component";
import {ExperimentBioinformaticsTabComponent} from "./experiment-detail/experiment-bioinformatics-tab.component";
import {TabConfirmIlluminaComponent} from "./new-experiment/tab-confirm-illumina.component";
import {UtilService} from "../services/util.service";
import {TabSeqProtoViewComponent} from "./new-experiment/tab-seq-proto-view.component";
import {TabAmendExperimentSetupComponent} from "./tab-amend-experiment-setup.component";

@Component({
    selector: 'amend-experiment-overview',
    template: `
        <div class="full-height full-width flex-container-col padded">
            <div>
                <img *ngIf="this.amendExpService.experiment?.requestCategory"
                     [src]="this.amendExpService.experiment?.requestCategory.icon" class="icon">
                {{ this.title }}
            </div>
            <div class="full-width flex-grow padding-light">
                <mat-tab-group class="full-height full-width" [(selectedIndex)]="this.selectedTabIndex"
                               (selectedTabChange)="this.onTabChange()">
                    <mat-tab *ngFor="let tab of this.tabs; let i = index" class="full-height full-width overflow-auto"
                             [label]="tab.label"
                             [disabled]="this.checkTabDisabled(i)">
                        <ndc-dynamic class="full-height full-width" [ndcDynamicComponent]="tab.component"
                                     [ndcDynamicInputs]="this.amendExpService.inputs"></ndc-dynamic>
                    </mat-tab>
                </mat-tab-group>
            </div>
            <div class="full-width flex-container-row justify-space-between">
                <div class="flex-container-row spaced-children-margin align-center">
                    <div>
                        <button mat-raised-button (click)="this.back()"
                                [disabled]="this.selectedTabIndex === 0 || this.checkTabDisabled(this.selectedTabIndex - 1)">
                            <mat-icon>arrow_left</mat-icon>
                            Back
                        </button>
                    </div>
                    <div>
                        <button mat-raised-button (click)="this.next()"
                                [disabled]="this.selectedTabIndex === this.tabs.length - 1 || this.checkTabDisabled(this.selectedTabIndex + 1)">
                            <mat-icon>arrow_right</mat-icon>
                            Next
                        </button>
                    </div>
                    <div>
                        <button mat-raised-button (click)="this.save()"
                                [disabled]="this.amendExpService.form.invalid || this.selectedTabIndex !== this.tabs.length - 1 || !this.billingAgreementChecked">
                            <img [src]="this.constantsService.ICON_SAVE" class="icon">Save
                        </button>
                    </div>
                    <div *ngIf="this.onConfirmTab()">
                        <mat-checkbox [(ngModel)]="this.billingAgreementChecked">
                            <div class="highlight-agreement">
                                {{ this.billingAgreementLabel }}
                            </div>
                        </mat-checkbox>
                    </div>
                </div>
                <div>
                    <button mat-raised-button (click)="this.promptToCancel()">Cancel</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .padding-light {
            padding: 0.5em;
        }
        .highlight-agreement {
            color: green;
            font-style: italic;
        }
    `]
})

export class AmendExperimentOverviewComponent implements OnInit, OnDestroy {

    public title: string = "";
    public billingAgreementLabel: string = "";
    public billingAgreementChecked: boolean = false;
    public selectedTabIndex: number = 0;
    public tabs: DynamicTab[] = [];
    private tabsRefArray: DynamicComponent[] = [];

    private experimentChangedSubscription: Subscription;
    private billingAgreementLabelSubscription: Subscription;

    @ViewChildren(DynamicComponent) tabsRef: QueryList<DynamicComponent>;

    constructor(public amendExpService: AmendExperimentService,
                public constantsService: ConstantsService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private router: Router,
                private experimentService: ExperimentsService) {
    }

    ngOnInit(): void {
        this.updateTitle();

        this.amendExpService.initialize();
        this.tabs = [
            {
                label: "Choose the services you want to add",
                component: TabAmendExperimentSetupComponent,
                formField: "form",
            }
        ];
        this.synchronizeTabForms();

        this.experimentChangedSubscription = this.amendExpService.onExperimentChanged.subscribe(() => {
            this.updateTitle();
            this.refreshTabs();
            this.synchronizeTabForms();
        });

        this.billingAgreementLabelSubscription = this.amendExpService.billingAgreementLabel.subscribe((value: string) => {
            this.billingAgreementLabel = value;
        });
    }

    private synchronizeTabForms(): void {
        setTimeout(() => {
            this.tabsRefArray = this.tabsRef.toArray();
            for (let index: number = 0; index < this.tabs.length; index++) {
                if (this.tabs[index].formField) {
                    this.amendExpService.setForm(this.tabs[index].label, this.tabsRefArray[index].componentRef.instance[this.tabs[index].formField]);
                }
            }
        });
    }

    private updateTitle(): void {
        let newTitle: string = "Add Illumina Services";
        if (this.amendExpService.experiment) {
            newTitle = "Adding Illumina sequence lanes to Experiment " + this.amendExpService.experiment.number;
        }
        this.title = newTitle;
    }

    public checkTabDisabled(index: number): boolean {
        if (index > 0) {
            return this.amendExpService.form.get(this.tabs[index - 1].label).invalid || this.checkTabDisabled(index - 1);
        } else {
            return false;
        }
    }

    private refreshTabs(): void {
        this.selectedTabIndex = 0;
        let newTabs: DynamicTab[] = this.tabs.slice(0, 1);
        if (this.amendExpService.experiment) {
            let seqOptionsTab: DynamicTab = {
                label: "Seq Options",
                component: TabSeqProtoViewComponent,
                formField: "form",
            };
            let annotationsTab: DynamicTab = {
                label: "Annotations",
                component: TabAnnotationViewComponent,
                formField: "form",
            };
            let experimentDesignIlluminaTab: DynamicTab = {
                label: "Experiment Design",
                component: TabSamplesIlluminaComponent,
                formField: "form",
            };
            let visibilityTab: DynamicTab = {
                label: "Visibility",
                component: TabVisibilityComponent,
                formField: "visibilityForm",
            };
            let bioinformaticsTab: DynamicTab = {
                label: "Bioinformatics",
                component: ExperimentBioinformaticsTabComponent,
                formField: "form",
            };
            let confirmIlluminaTab: DynamicTab = {
                label: "Confirm",
                component: TabConfirmIlluminaComponent,
                formField: "form",
            };

            if (this.amendExpService.experiment.requestCategory.isIlluminaType === "Y") {
                newTabs.push(...[
                    seqOptionsTab,
                    annotationsTab,
                    experimentDesignIlluminaTab,
                    visibilityTab,
                    bioinformaticsTab,
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

    public onConfirmTab(): boolean {
        return this.tabs.length > 1 && this.selectedTabIndex === this.tabs.length - 1;
    }

    public back(): void {
        this.selectedTabIndex--;
    }

    public next(): void {
        this.selectedTabIndex++;
    }

    public save(): void {
        this.experimentService.saveRequest(this.amendExpService.experiment).subscribe((result: any) => {
            if (result && result.idRequest) {
                this.dialogsService.alert("Experiment #" + result.requestNumber + " has been added to the GNomEx repository", "Experiment Saved");
                this.gnomexService.navByNumber(result.requestNumber);
            }
        });
    }

    public promptToCancel(): void {
        this.dialogsService.confirm("Warning", "The experiment has not been saved. Are you sure you want to quit?").subscribe((answer: boolean) => {
            if (answer) {
                this.router.navigateByUrl('home');
            }
        });
    }

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.experimentChangedSubscription);
        UtilService.safelyUnsubscribe(this.billingAgreementLabelSubscription);
    }

}

interface DynamicTab {
    label: string,
    component: Type<any>,
    formField: string,
}
