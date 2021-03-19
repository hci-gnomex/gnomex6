import {Component, Input, OnInit} from "@angular/core";
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
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'tab-external-setup',
    templateUrl: "./tab-external-setup.component.html",
    styles: [`
        
        .margin-right {
            margin-right: 10em;
        }
        
        .experiment-platform-label {
            width: 20em;
        }
        
    `]
})

export class TabExternalSetupComponent implements OnInit {

    private _experiment:Experiment;
    @Input() public set experiment(value: Experiment) {
        this._experiment = value;

        this.experiment.RequestProperties = this.experiment.RequestProperties.filter((annotation: any) => {
            return annotation
                && annotation.isActive === 'Y'
                && annotation.idCoreFacility === this.experiment.idCoreFacility;
        });
    }
    public get experiment(): Experiment {
        return this._experiment;
    }

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

    private submittersSubscription: Subscription;

    public possibleSubmitters_loaded: boolean = false;


    constructor(public constantsService: ConstantsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private labListService: LabListService,
                private getLabService: GetLabService,
                public prefService: UserPreferencesService,
                private topicService: TopicService,
                private organismService: OrganismService,
                private dictionaryService: DictionaryService,
                private dialog: MatDialog,
                private appUserService: AppUserListService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService) {

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

                    this._experiment.experimentOwner = this.form.get('appUser').value;
                    this._experiment.idOwner = this.form.get('appUser').value.idAppUser;
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
        }, (err: IGnomexErrorResponse) => {
            console.error(err);
        });

        this.requestCategoryList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY)
            .filter((cat: any) => cat.isActive === 'Y' && cat.isExternal === 'Y')
            .sort(this.prefService.createDisplaySortFunction("sortOrder"));
    }


    public onLabSelected(event: any): void {
        if (this.showUserSelection) {
            this.form.get("appUser").setValue("");
            this.userList = [];

            if (event) {
                if (!this.submittersSubscription) {
                    this.submittersSubscription = this.getLabService.getSubmittersForLab(event.idLab, 'Y', 'N').subscribe((submitters: any[]) => {
                        if (submitters) {
                            this.userList = submitters.filter((a) => {
                                return a && a.isActive && a.isActive === 'Y';
                            });
                            this.userList.sort(this.prefService.createUserDisplaySortFunction());
                            setTimeout(() => {
                                this.possibleSubmitters_loaded = true;
                            });
                        } else {
                            this.userList = [];
                            this.possibleSubmitters_loaded = false;
                        }
                    });
                } else {
                    this.getLabService.getSubmittersForLab(event.idLab, 'Y', 'N');
                }
            }
        }

        this.getLabProjects();
        this.experiment.lab = event;

        if (Array.isArray(this.requestApplicationList) && this.requestApplicationList.length === 1) {
            this.form.get("requestCategory").setValue(this.requestApplicationList[0]);
        }
    }

    public onUserSelected(): void {
        if (this.showUserSelection) {
            this.preselectProject("idAppUser", this.form.get("appUser").value ? this.form.get("appUser").value.idAppUser : "");
        }

        this.experiment.experimentOwner = this.form.get("appUser").value;
    }

    public onTopicSelected(): void {
        if (this.form.get("topic").value) {
            this.experiment.topics = this.form.get("topic").value;
        } else {
            this.experiment.topics = [];
        }
    }

    public onOrganismSelected(): void {
        this.experiment.organism = this.form.get("organism").value;
    }

    public onRequestCategorySelected(): void {
        let codeRequestCategory: string = this.form.get("requestCategory").value ? this.form.get("requestCategory").value.codeRequestCategory : "";

        this.form.get("application").setValue("");

        this.requestApplicationList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY_APPLICATION)
            .filter((app: any) => app.canRead === 'Y' && app.codeRequestCategory === codeRequestCategory)
            .sort(this.prefService.createDisplaySortFunction("display"));

        this.experiment.requestCategory = this.form.get("requestCategory").value;
        this.experiment.idCoreFacility = this.form.get("requestCategory").value ? this.form.get("requestCategory").value.idCoreFacility : "";
    }

    public onApplicationSelected(): void {
        this.experiment.application_object = this.form.get("application").value;
    }

    public onProjectSelected(): void {
        this.experiment.projectObject = this.form.get("project").value;
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
            }, (err: IGnomexErrorResponse) => {
                console.error(err);
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
        config.autoFocus = false;
        config.data = {
            idProject: this.form.get("project").value.idProject,
            disableLab: true
        };

        this.dialogsService.genericDialogContainer(CreateProjectComponent, "Edit Project", this.constantsService.ICON_FOLDER_ADD, config, {
            actions: [
                {
                    type: ActionType.PRIMARY,
                    icon: this.constantsService.ICON_SAVE,
                    name: "Save",
                    internalAction: "save"
                },
                {
                    type: ActionType.SECONDARY,
                    name: "Cancel",
                    internalAction: "cancel"
                }
            ]
        }).subscribe((result: any) => {
            if(result) {
                this.getLabProjects(result);
            }
        });
    }

    public newProject(): void {
        if(!this.form.get("appUser").value) {
            this.dialogsService.alert("Please select the user submitting the request", null, DialogType.ALERT);
            return;
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "45em";
        config.autoFocus = false;
        config.data = {
            labList:            this.labList,
            selectedLabItem:    this.form.get("lab").value.idLab,
            disableLab: true
        };

        this.dialogsService.genericDialogContainer(CreateProjectComponent, "New Project", this.constantsService.ICON_FOLDER_ADD, config, {
            actions: [
                {
                    type: ActionType.PRIMARY,
                    icon: this.constantsService.ICON_SAVE,
                    name: "Save",
                    internalAction: "save"
                },
                {
                    type: ActionType.SECONDARY,
                    name: "Cancel",
                    internalAction: "cancel"
                }
            ]
        }).subscribe((result: any) => {
            if(result) {
                this.getLabProjects(result);
            }
        });
    }

    public toggleShowLinkToTopic(): void {
        this.showLinkToTopic = !this.showLinkToTopic;
        if (this.showLinkToTopic && this.topicList.length === 0) {
            this.dialogsService.startDefaultSpinnerDialog();

            this.topicService.getTopics().subscribe((result: any[]) => {
                this.topicList = result.sort(this.prefService.createDisplaySortFunction("name"));

                this.dialogsService.stopAllSpinnerDialogs();
            }, (err: IGnomexErrorResponse) => {
                console.error(err);
                this.dialogsService.stopAllSpinnerDialogs();
            });
        }
        if (!this.showLinkToTopic) {
            this.form.get('topic').setValue("");
        }
    }
}
