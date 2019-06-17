import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {LabListService} from "../../services/lab-list.service";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {Subscription} from "rxjs";
import {GetLabService} from "../../services/get-lab.service";
import {ConstantsService} from "../../services/constants.service";
import {TopicService} from "../../services/topic.service";
import {OrganismService} from "../../services/organism.service";
import {UtilService} from "../../services/util.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {CreateProjectComponent} from "../create-project.component";
import {AppUserListService} from "../../services/app-user-list.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Experiment} from "../../util/models/experiment.model";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'tab-external-setup',
    template: `
        <div class="full-height full-width flex-container-col padded">
            <custom-combo-box placeholder="Lab group" [options]="this.labList" class="half-width"
                                [displayField]="this.prefService.labDisplayField"
                                [formControl]="this.form.get('lab')">
            </custom-combo-box>
            <custom-combo-box *ngIf="this.showUserSelection" placeholder="Submitter" [options]="this.userList" class="half-width"
                                [displayField]="this.prefService.userDisplayField"
                                [formControl]="this.form.get('appUser')">
            </custom-combo-box>
            <div class="flex-container-row align-center">
                <custom-combo-box placeholder="Project folder for organizing experiments" [options]="this.projectList" class="half-width"
                                    [displayField]="'name'"
                                    [formControl]="this.form.get('project')">
                </custom-combo-box>
                <div>
                    <button mat-button [disabled]="!this.form.get('project').value" (click)="this.editProject()">Edit</button>
                </div>
                <div>
                    <button mat-button (click)="this.newProject()">New</button>
                </div>
            </div>
            <div class="flex-container-row full-width align-center">
                <div [hidden]="!this.showLinkToTopic" class="half-width">
                    <mat-form-field class="full-width">
                        <mat-select placeholder="Topic(s)" [formControl]="this.form.get('topic')" multiple>
                            <mat-option *ngFor="let top of this.topicList" [value]="top">{{top.name}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>
                <div>
                    <button mat-button (click)="this.toggleShowLinkToTopic()"><img [src]="this.constantsService.ICON_TOPIC" class="icon">{{showLinkToTopic ? 'Hide' : 'Show'}} Link to Topic</button>
                </div>
            </div>
            <custom-combo-box placeholder="Organism" [options]="this.organismList" class="half-width"
                                [displayField]="'display'"
                                [formControl]="this.form.get('organism')">
            </custom-combo-box>
            <div class="flex-container-row full-width align-center">
                <label class="margin-right">Experiment platform</label>
                <mat-radio-group class="flex-container-col" [formControl]="this.form.get('requestCategory')">
                    <mat-radio-button *ngFor="let reqCat of this.requestCategoryList" [value]="reqCat">
                        <div class="flex-container-row">
                            <div class="experiment-platform-label"><img [src]="reqCat.icon" class="icon">{{reqCat.display}}</div>
                            <div>{{reqCat.notes}}</div>
                        </div>
                    </mat-radio-button>
                </mat-radio-group>
            </div>
            <custom-combo-box placeholder="Experiment type" [options]="this.requestApplicationList" class="half-width"
                                [displayField]="'display'"
                                [formControl]="this.form.get('application')">
            </custom-combo-box>
        </div>
    `,
    styles: [`
        .margin-right {
            margin-right: 2em;
        }
        .experiment-platform-label {
            width: 20em;
        }
    `]
})

export class TabExternalSetupComponent implements OnInit, OnChanges, OnDestroy {

    @Input() experiment: Experiment;

    public form: FormGroup;
    public labList: any[] = [];
    public showUserSelection: boolean = false;
    public userList: any[] = [];
    public projectList: any[] = [];
    public showLinkToTopic: boolean = false;
    public topicList: any[] = [];
    public organismList: any[] = [];
    public requestCategoryList: any[] = [];
    public requestApplicationList: any[] = [];

    private subscriptions: Subscription[] = [];

    constructor(public constantsService: ConstantsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private labListService: LabListService,
                private getLabService: GetLabService,
                private prefService: UserPreferencesService,
                private topicService: TopicService,
                private organismService: OrganismService,
                private dictionaryService: DictionaryService,
                private dialog: MatDialog,
                private appUserService: AppUserListService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService,) {

        this.form = this.formBuilder.group({
            lab: ["", [Validators.required]],
            appUser: ["", [Validators.required]],
            project: ["", [Validators.required]],
            topic: ["", []],
            organism: ["", [Validators.required]],
            requestCategory: ["", [Validators.required]],
            application: ["", [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.showUserSelection = this.securityAdvisor.isAdmin || this.securityAdvisor.isSuperAdmin;
        if (!this.showUserSelection) {
            setTimeout(() => {
                this.appUserService.getAppUserNew("" + this.securityAdvisor.idAppUser).subscribe((user: any) => {
                    this.form.get("appUser").setValue(user);
                });
            });
        }

        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response.sort(this.prefService.createLabDisplaySortFunction());
        });
        this.organismService.getOrganismListNew().subscribe((result: any) => {
            this.organismList = UtilService.getJsonArray(result, result.Organism)
                .filter((o: any) => o.isActive === 'Y' && o.canRead === 'Y')
                .sort(this.prefService.createDisplaySortFunction("display"));
        });
        this.requestCategoryList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY)
            .filter((cat: any) => cat.isActive === 'Y' && cat.isExternal === 'Y')
            .sort(this.prefService.createDisplaySortFunction("sortOrder"));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.experiment && this.subscriptions.length === 0) {
            this.registerSubscriptions();
        }
    }

    private registerSubscriptions(): void {
        this.subscriptions.push(this.form.get("lab").valueChanges.subscribe(() => {
            if (this.showUserSelection) {
                this.form.get("appUser").setValue("");
                this.userList = [];
                if (this.form.get("lab").value) {
                    this.getLabService.getSubmittersForLab(this.form.get("lab").value.idLab, "N", "N").subscribe((result: any[]) => {
                        this.userList = result.sort(this.prefService.createUserDisplaySortFunction());
                    });
                }
            }
            this.getLabProjects();
            this.experiment.lab = this.form.get("lab").value;
        }));

        this.subscriptions.push(this.form.get("appUser").valueChanges.subscribe(() => {
            if (this.showUserSelection) {
                this.preselectProject("idAppUser", this.form.get("appUser").value ? this.form.get("appUser").value.idAppUser : "");
            }
            this.experiment.experimentOwner = this.form.get("appUser").value;
        }));

        this.subscriptions.push(this.form.get("project").valueChanges.subscribe(() => {
            this.experiment.projectObject = this.form.get("project").value;
        }));

        this.subscriptions.push(this.form.get("topic").valueChanges.subscribe(() => {
            if (this.form.get("topic").value) {
                this.experiment.topics = this.form.get("topic").value;
            } else {
                this.experiment.topics = [];
            }
        }));

        this.subscriptions.push(this.form.get("organism").valueChanges.subscribe(() => {
            this.experiment.organism = this.form.get("organism").value;
        }));

        this.subscriptions.push(this.form.get("requestCategory").valueChanges.subscribe(() => {
            let codeRequestCategory: string = this.form.get("requestCategory").value ? this.form.get("requestCategory").value.codeRequestCategory : "";
            this.form.get("application").setValue("");
            this.requestApplicationList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY_APPLICATION)
                .filter((app: any) => app.canRead === 'Y' && app.codeRequestCategory === codeRequestCategory)
                .sort(this.prefService.createDisplaySortFunction("display"));
            this.experiment.requestCategory = this.form.get("requestCategory").value;
            this.experiment.idCoreFacility = this.form.get("requestCategory").value ? this.form.get("requestCategory").value.idCoreFacility : "";
        }));

        this.subscriptions.push(this.form.get("application").valueChanges.subscribe(() => {
            this.experiment.application_object = this.form.get("application").value;
        }));
    }

    private getLabProjects(idProjectToSelect?: string): void {
        if (this.form.get("lab").value) {
            this.getLabService.getLabProjects(this.form.get("lab").value.idLab).subscribe((result: any[]) => {
                this.projectList = result.sort(this.prefService.createDisplaySortFunction("name"));
                if (idProjectToSelect) {
                    this.preselectProject("idProject", idProjectToSelect);
                } else {
                    this.preselectProject("idAppUser", this.form.get("appUser").value.idAppUser);
                }
            });
        } else {
            this.projectList = [];
            this.preselectProject();
        }
    }

    private preselectProject(attribute?: string, value?: string): void {
        let newValue: any;
        if (attribute && value) {
            for (let proj of this.projectList) {
                if (proj[attribute] === value) {
                    newValue = proj;
                    break;
                }
            }
        }
        this.form.get("project").setValue(newValue);
    }

    public editProject(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "45em";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {
            idProject: this.form.get("project").value.idProject,
        };

        this.dialogsService.genericDialogContainer(CreateProjectComponent, "Edit Project", this.constantsService.ICON_FOLDER_ADD, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
                    if(result) {
                        this.getLabProjects(result);
                    }
        });
    }

    public newProject(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "45em";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {};

        this.dialogsService.genericDialogContainer(CreateProjectComponent, "New Project", this.constantsService.ICON_FOLDER_ADD, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.getLabProjects(result);
            }
        });
    }

    public toggleShowLinkToTopic(): void {
        this.showLinkToTopic = !this.showLinkToTopic;
        if (this.showLinkToTopic && this.topicList.length === 0) {
            this.topicService.getTopics().subscribe((result: any[]) => {
                this.topicList = result.sort(this.prefService.createDisplaySortFunction("name"));
            });
        }
        if (!this.showLinkToTopic) {
            this.form.get('topic').setValue("");
        }
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            UtilService.safelyUnsubscribe(sub);
        }
    }

}
