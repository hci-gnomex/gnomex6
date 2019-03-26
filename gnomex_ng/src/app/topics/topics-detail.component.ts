import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {TopicService} from "../services/topic.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {
    MatAutocomplete,
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
    MatSnackBar,
} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {URLSearchParams} from "@angular/http";
import {PropertyService} from "../services/property.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {BasicEmailDialogComponent} from "../util/basic-email-dialog.component";
import {ShareLinkDialogComponent} from "../util/share-link-dialog.component";
import {first} from "rxjs/operators";
import {UserPreferencesService} from "../services/user-preferences.service";
import {AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    templateUrl: "./topics-detail.component.html",
    styles: [`
        .flex-container {
            display: flex;
            justify-content: space-between;
            flex:1;
        }
        .flexbox-column {
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }
        .mat-tab-group-border {
            border: 1px solid #e8e8e8;
        }
        .formField {
            width: 30%;
            margin: 0 0.5em;
        }
        :host /deep/ angular-editor #editor {
            resize: none;
        }
    `]
})

export class TopicDetailComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("autoLab") matAutoLab: MatAutocomplete;

    public showSpinner: boolean = false;
    public topicNode: any;
    private inInitialization: boolean = false;
    public topicForm: FormGroup;
    public visRadio: Array<any>;
    private topicListNodeSubscription: Subscription;
    private topicLab: any;
    public labList: any[] = [];
    private emailImportDialogRef: MatDialogRef<BasicEmailDialogComponent>;

    private editorConfig: AngularEditorConfig;
    private labChangesSubscription: Subscription;

    constructor(private route: ActivatedRoute,
                public topicService: TopicService,
                private fb: FormBuilder,
                private gnomexService: GnomexService,
                public constService: ConstantsService,
                public getLabService: GetLabService,
                private propertyService: PropertyService,
                private dialogService: DialogsService,
                private dialog: MatDialog,
                private snackBar: MatSnackBar,
                public prefService: UserPreferencesService) {
    }

    ngOnInit() {
        this.visRadio = [
            {display: "Owner    (the owner and the group manager)", value: "OWNER", icon: this.constService.ICON_TOPIC_OWNER},
            {display: "All Lab Members", value: "MEM", icon: this.constService.ICON_TOPIC_MEMBER}
        ];
        if(this.propertyService.isPublicVisbility()) {
            this.visRadio.push( {display: "Public Access", value: "PUBLIC", icon: this.constService.ICON_TOPIC_PUBLIC});
        }

        this.editorConfig = {
            spellcheck: true,
            height: '25em',
        };

        this.topicForm = this.fb.group({
            name: ["", Validators.required],
            idLab: ["", Validators.required],
            idAppUser: ["", Validators.required],
            description: "",
            codeVisibility: ["", Validators.required],
            idTopic: ["", Validators.required],
            idParentTopic: "",
        });
        this.labChangesSubscription = this.topicForm.get("idLab").valueChanges.subscribe(() => {
            if (!this.topicForm.get("idLab").value) {
                return;
            }
            let params: URLSearchParams = new URLSearchParams();
            params.set("idLab", this.topicForm.get("idLab").value);
            params.set("includeBillingAccounts", "N");
            params.set("includeProductCounts", "N");

            this.getLabService.getLabMembers_fromBackend(params);
            if (!this.inInitialization) {
                this.topicForm.get("idAppUser").setValue("");
            }
        });

        this.topicListNodeSubscription = this.topicService.getSelectedTreeNodeObservable().subscribe(data => {
                this.topicNode = data;
        });

        this.route.data.forEach(data => {
            this.inInitialization = true;
            this.topicLab = data.topicLab.Lab;

            if(this.topicNode) {
                this.labList = this.gnomexService.labList
                    .filter(lab => lab.canGuestSubmit === "Y" || lab.canSubmitRequests === "Y" || lab.idLab === this.topicNode.idLab)
                    .sort(this.prefService.createLabDisplaySortFunction());

                let memList: Array<any> = (this.topicLab && this.topicLab.members) ? (Array.isArray(this.topicLab.members) ? this.topicLab.members : [this.topicLab.members.AppUser]) : [];
                let activeMemList: Array<any> = memList.filter(appUser => appUser.isActive === "Y");
                this.getLabService.labMembersSubject.next(activeMemList);

                this.topicForm.get("idLab").setValue(this.topicNode.idLab ? this.topicNode.idLab : "");
                this.topicForm.get("name").setValue(this.topicNode.name);
                this.topicForm.get("idAppUser").setValue(this.topicNode.idAppUser ? this.topicNode.idAppUser : "");
                this.topicForm.get("codeVisibility").setValue(this.topicNode.codeVisibility);
                this.topicForm.get("idTopic").setValue(this.topicNode.idTopic);
                this.topicForm.get("description").setValue(this.topicNode.description);
                this.topicForm.get("idParentTopic").setValue(this.topicNode.idParentTopic);

                let canEdit: boolean = this.topicNode.canWrite === "Y";
                if (canEdit) {
                    this.topicForm.enable();
                } else {
                    this.topicForm.disable();
                }
                this.editorConfig.editable = canEdit;
                this.editorConfig.enableToolbar = canEdit;
                this.editorConfig.showToolbar = canEdit;
                this.topicForm.markAsPristine();
            }

            this.inInitialization = false;
        });
    }

    ngAfterViewInit(): void {
    }

    save() {
        this.showSpinner = true;

        let params: HttpParams = new HttpParams()
            .set("description", this.topicForm.get("description").value)
            .set("name", this.topicForm.get("name").value)
            .set("idTopic", this.topicForm.get("idTopic").value)
            .set("idLab", this.topicForm.get("idLab").value)
            .set("idAppUser", this.topicForm.get("idAppUser").value)
            .set("idParentTopic", this.topicForm.get("idParentTopic").value)
            .set("codeVisibility", this.topicForm.get("codeVisibility").value);

        this.topicService.saveTopic(params).subscribe( (result: any) => {
            this.showSpinner = false;
            if (result && result.result === 'SUCCESS') {
                this.topicForm.get("codeVisibility").setValue(result.codeVisibility);
                this.topicService.refreshTopicsList_fromBackend();
                this.topicForm.markAsPristine();

                let visMessage: string = result.visibilityMsg;

                if (visMessage) {
                    let message = "A topic may not be given broader visibility than its parent. Since the parent is currently only visible to " +
                        visMessage + ", visibility for this topic has been set to the same level.";
                    this.dialogService.confirm(message, null);
                }
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogService.alert("An error occurred while saving the topic" + message);
            }
        });
    }

    onShareLinkClick(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.data = {
            name:   this.topicNode.name,
            number: this.topicNode.idTopic,
            type:   "topicNumber"
        };
        this.dialog.open(ShareLinkDialogComponent, configuration);
    }

    onEmailClick(): void {
        let idAppUser = this.topicForm.get("idAppUser").value;
        if(!idAppUser) {
            this.dialogService.confirm("There is no owner selected for this topic. " +
                " Please select an owner in the dropdown and save before" +
                " trying to communicate through email.", null);
            return;
        }

        let saveFn = (data: any) => {
            data.format =  "text";
            data.idAppUser = idAppUser;

            let params: HttpParams = new HttpParams()
                .set("body", data.body)
                .set("format", data.format)
                .set("fromAddress", data.fromAddress)
                .set("idAppUser", data.idAppUser)
                .set("subject", data.subject);

            this.topicService.emailTopicOwner(params).pipe(first()).subscribe(resp => {
                let email = <BasicEmailDialogComponent>this.emailImportDialogRef.componentInstance;
                email.showSpinner = false;

                if(resp && resp.result === "SUCCESS") {
                    this.emailImportDialogRef.close();

                    this.snackBar.open("Email was sent", "Email Topic Owner", {
                        duration: 2000
                    });
                } else if(resp && resp.message) {
                    this.dialogService.alert("Error sending email" + ": " + resp.message);
                }
            }, error => {
                this.dialogService.alert(error);
            });
        };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "45em";
        configuration.height = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.disableClose = true;
        configuration.data = {
            saveFn: saveFn,
            title: "Email Topic Owner",
            parentComponent: "Topics",
            subjectText: "",
        };

        this.emailImportDialogRef = this.dialog.open(BasicEmailDialogComponent, configuration);
    }

    ngOnDestroy() {
        this.topicListNodeSubscription.unsubscribe();
        this.labChangesSubscription.unsubscribe();
    }
}
