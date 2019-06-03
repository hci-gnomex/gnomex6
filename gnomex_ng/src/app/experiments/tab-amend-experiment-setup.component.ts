import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {DictionaryService} from "../services/dictionary.service";
import {UtilService} from "../services/util.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {AmendExperimentService} from "../services/amend-experiment.service";
import {HttpParams} from "@angular/common/http";
import {ExperimentsService} from "./experiments.service";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {DialogsService} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {Experiment} from "../util/models/experiment.model";
import {GnomexService} from "../services/gnomex.service";
import {PropertyService} from "../services/property.service";

@Component({
    selector: 'tab-amend-experiment-setup',
    template: `
        <div class="full-height full-width flex-container-col padded">
            <ol>
                <li>
                    <div class="flex-container-row align-center">
                        <label class="row-label">Verify your lab group</label>
                        <custom-combo-box [options]="this.labList" class="row-field"
                                          [displayField]="this.prefService.labDisplayField" [valueField]="'idLab'"
                                          [formControl]="this.form.get('idLab')">
                        </custom-combo-box>
                    </div>
                </li>
                <li>
                    <div class="flex-container-row align-center">
                        <label class="row-label">Select the person who submitted the request (optional)</label>
                        <custom-combo-box [options]="this.userList" class="row-field"
                                          [displayField]="this.prefService.userDisplayField" [valueField]="'idAppUser'"
                                          [formControl]="this.form.get('idAppUser')">
                        </custom-combo-box>
                    </div>
                </li>
                <li>
                    <div class="flex-container-row align-center">
                        <label class="row-label">Select the category that best describes the services that you will be adding to this request</label>
                        <mat-radio-group [formControl]="this.form.get('codeRequestCategory')" class="flex-container-col row-field">
                            <mat-radio-button *ngFor="let rc of this.requestCategoryList" [value]="rc.codeRequestCategory">
                                <div class="flex-container-row">
                                    <div class="req-cat-icon"><img [src]="rc.icon" [alt]=""></div>
                                    <div class="req-cat-label">{{rc.display}}</div>
                                    <div class="italic">Adding sequence lanes only</div>
                                </div>
                            </mat-radio-button>
                        </mat-radio-group>
                    </div>
                </li>
                <li>
                    <div class="flex-container-row align-center">
                        <label class="row-label">Select the existing request</label>
                        <div class="row-field">
                            <label class="small-margin-right">Submitted in last</label>
                            <mat-radio-group [formControl]="this.form.get('timeFilter')">
                                <mat-radio-button *ngFor="let tf of this.timeFilterList" class="small-margin-right" [value]="tf.value">{{tf.display}}</mat-radio-button>
                            </mat-radio-group>
                        </div>
                    </div>
                </li>
            </ol>
            <div class="flex-grow border">
                <tree-root #candidateRequestTree [nodes]="this.candidateRequestList" [options]="this.treeOptions" (activate)="this.onTreeActivate($event)">
                    <ng-template #treeNodeTemplate let-node>
                        <img src="{{node.data.icon}}" class="icon">
                        <span>{{node.data.label}}</span>
                    </ng-template>
                </tree-root>
            </div>
        </div>
    `,
    styles: [`
        .row-label {
            flex: 1;
        }
        .row-field {
            flex: 1;
        }
        .small-margin-right {
            margin-right: 1em;
        }
        li {
            margin-bottom: 1em;
        }
        .req-cat-icon {
            width: 2em;
        }
        .req-cat-label {
            width: 18em;
        }
        .border {
            border: 1px solid black;
        }
    `]
})

export class TabAmendExperimentSetupComponent implements OnInit, OnDestroy {

    @ViewChild("candidateRequestTree") private candidateRequestTreeComponent: TreeComponent;

    public form: FormGroup;
    public labList: any[] = [];
    public userList: any[] = [];
    public requestCategoryList: any[] = [];
    public timeFilterList: any[] = [];
    public candidateRequestList: any[] = [];
    public treeOptions: ITreeOptions = {};

    private subscriptions: Subscription[] = [];
    private ignoreChanges: boolean = false;

    constructor(private labListService: LabListService,
                private amendExperimentService: AmendExperimentService,
                private experimentsService: ExperimentsService,
                private securityAdvisorService: CreateSecurityAdvisorService,
                private constantsService: ConstantsService,
                private getLabService: GetLabService,
                private dialogsService: DialogsService,
                private prefService: UserPreferencesService,
                private gnomexService: GnomexService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService,
                private dictionaryService: DictionaryService,
                private formBuilder: FormBuilder) {

        this.form = this.formBuilder.group({
            idLab: ["", [Validators.required]],
            idAppUser: ["", []],
            codeRequestCategory: ["", [Validators.required]],
            timeFilter: ["", []],
            experiment: ["", [Validators.required]],
        });
    }

    // TODO fix styling of tree when too tall

    ngOnInit(): void {
        this.timeFilterList = [
            { value: "lastWeek", display: "week" },
            { value: "lastMonth", display: "month" },
            { value: "lastThreeMonths", display: "3 months" },
            { value: "lastYear", display: "year" },
        ];
        this.form.get("timeFilter").setValue("lastThreeMonths");

        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response.sort(this.prefService.createLabDisplaySortFunction());
        });

        this.requestCategoryList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY)
            .filter((cat: any) =>
                cat.isActive === 'Y' && cat.isInternal === 'Y' && cat.isIlluminaType === 'Y' && cat.isClinicalResearch !== 'Y' && this.securityAdvisorService.isMyCoreFacility(cat.idCoreFacility))
            .sort(this.prefService.createDisplaySortFunction("sortOrder"));

        this.subscriptions.push(this.form.get("idLab").valueChanges.subscribe(() => {
            this.ignoreChanges = true;
            this.form.get("idAppUser").setValue("");
            this.ignoreChanges = false;
            this.userList = [];
            if (this.form.get("idLab").value) {
                this.getLabService.getSubmittersForLab(this.form.get("idLab").value, "N", "N").subscribe((result: any[]) => {
                    this.userList = result.sort(this.prefService.createUserDisplaySortFunction());
                });
            }
            this.updateCandidateRequestList();
        }));

        this.subscriptions.push(this.form.get("idAppUser").valueChanges.subscribe(() => {
            if (!this.ignoreChanges) {
                this.updateCandidateRequestList();
            }
        }));

        this.subscriptions.push(this.form.get("codeRequestCategory").valueChanges.subscribe(() => {
            this.updateCandidateRequestList();
        }));

        this.subscriptions.push(this.form.get("timeFilter").valueChanges.subscribe(() => {
            this.updateCandidateRequestList();
        }));

        this.subscriptions.push(this.form.get("experiment").valueChanges.subscribe(() => {
            this.amendExperimentService.experiment = this.form.get("experiment").value;
        }));
    }

    private updateCandidateRequestList(): void {
        if (this.form.get("experiment").value) {
            this.form.get("experiment").setValue(null);
        }

        if (this.form.get("idLab").value && this.form.get("codeRequestCategory").value) {
            this.dialogsService.startDefaultSpinnerDialog();
            let params: HttpParams = new HttpParams()
                .set("idLab", this.form.get("idLab").value)
                .set("showSamples", "N")
                .set("showCategory", "N")
                .set("showExternalExperiments", "N")
                .set("searchPublicProjects", "N")
                .set("publicExperimentsInOtherGroups", "N")
                .set("isBioanalyzer", "N")
                .set("isSolexa", "Y")
                .set("codeRequestCategory", this.form.get("codeRequestCategory").value)
                .set(this.form.get("timeFilter").value, "Y");
            if (this.form.get("idAppUser").value) {
                params = params.set("idAppUser", this.form.get("idAppUser").value);
            }

            this.experimentsService.getProjectRequestListNew(params).subscribe((response: any) => {
                this.dialogsService.stopAllSpinnerDialogs();
                if (response && response.Lab) {
                    response.Lab.icon = this.constantsService.ICON_GROUP;
                    if (response.Lab.Project) {
                        response.Lab.children = UtilService.getJsonArray(response.Lab.Project, response.Lab.Project);
                        for (let proj of response.Lab.children) {
                            proj.icon = this.constantsService.ICON_FOLDER;
                            proj.children = UtilService.getJsonArray(proj.Request, proj.Request);
                        }
                    } else {
                        response.Lab.children = [];
                    }
                    this.candidateRequestList = [response.Lab];
                    setTimeout(() => {
                        this.candidateRequestTreeComponent.treeModel.expandAll();
                    });
                } else {
                    this.candidateRequestList = [];
                    this.dialogsService.alert("No experiments found");
                }
            }, () => {
                this.dialogsService.stopAllSpinnerDialogs();
            });
        } else if (this.candidateRequestList.length > 0) {
            this.candidateRequestList = [];
        }
    }

    public onTreeActivate(event: any): void {
        if (event && event.node.data.idRequest) {
            this.dialogsService.startDefaultSpinnerDialog();
            this.experimentsService.getExperiment(event.node.data.idRequest).subscribe((response: any) => {
                this.dialogsService.stopAllSpinnerDialogs();
                if (response && response.Request) {
                    let request: Experiment = Experiment.createExperimentObjectFromAny(this.dictionaryService, this.gnomexService, this.propertyService, this.securityAdvisor, response.Request);
                    request.amendState = AmendExperimentService.AMEND_ADD_SEQ_LANES;
                    this.form.get("experiment").setValue(request);
                } else {
                    this.dialogsService.alert("An error occurred loading the experiment", "Warning");
                }
            }, () => {
                this.dialogsService.stopAllSpinnerDialogs();
            });
        }
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            UtilService.safelyUnsubscribe(sub);
        }
    }

}
