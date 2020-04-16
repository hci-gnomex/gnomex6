import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {TopicService} from "../services/topic.service";
import {ActivatedRoute} from "@angular/router";
import {Observable, Subscription, throwError} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {MatDialogConfig} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {PropertyService} from "../services/property.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {BasicEmailDialogComponent} from "../util/basic-email-dialog.component";
import {ShareLinkDialogComponent} from "../util/share-link-dialog.component";
import {catchError, map} from "rxjs/operators";
import {UserPreferencesService} from "../services/user-preferences.service";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

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
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})

export class TopicDetailComponent implements OnInit, OnDestroy, AfterViewInit {

    public showSpinner: boolean = false;
    public topicNode: any;
    private inInitialization: boolean = false;
    public topicForm: FormGroup;
    public visRadio: Array<any>;
    private topicListNodeSubscription: Subscription;
    private topicLab: any;
    public labList: any[] = [];

    public editorConfig: AngularEditorConfig;
    private labChangesSubscription: Subscription;

    constructor(private route: ActivatedRoute,
                public topicService: TopicService,
                private fb: FormBuilder,
                private gnomexService: GnomexService,
                public constService: ConstantsService,
                public getLabService: GetLabService,
                private propertyService: PropertyService,
                private dialogService: DialogsService,
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
            let params: HttpParams = new HttpParams()
                .set("idLab", this.topicForm.get("idLab").value)
                .set("includeBillingAccounts", "N")
                .set("includeProductCounts", "N");

            this.getLabService.getLabMembers_fromBackend(params);
            if (!this.inInitialization) {
                this.topicForm.get("idAppUser").setValue("");
            }
        });

        this.topicListNodeSubscription = this.topicService.getSelectedTreeNodeObservable().subscribe(data => {
            this.inInitialization = true;
            this.topicNode = data;
            if(this.topicNode){
                this.labList = this.gnomexService.labList
                    .filter(lab => lab.canGuestSubmit === "Y" || lab.canSubmitRequests === "Y" || lab.idLab === this.topicNode.idLab)
                    .sort(this.prefService.createLabDisplaySortFunction());

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

        this.route.data.forEach(data => {

            this.topicLab = data.topicLab.Lab;

            if(this.topicNode) {

                let memList: Array<any> = (this.topicLab && this.topicLab.members) ? (Array.isArray(this.topicLab.members) ? this.topicLab.members : [this.topicLab.members.AppUser]) : [];
                let activeMemList: Array<any> = memList.filter(appUser => appUser.isActive === "Y");
                this.getLabService.labMembersSubject.next(activeMemList);
            }
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
                    this.dialogService.alert(message, null, DialogType.SUCCESS);
                }
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogService.error("An error occurred while saving the topic" + message);
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    onShareLinkClick(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.data = {
            number: this.topicNode.idTopic,
            type:   "topicNumber"
        };

        let topicName: string = "Topic T" + this.topicNode.idTopic + " - " + this.topicNode.name;
        topicName = UtilService.getSubStr(topicName, 35);

        this.dialogService.genericDialogContainer(ShareLinkDialogComponent,
            "Web Link for " + topicName, null, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Copy To Clipboard", internalAction: "copyToClipboard"}
                ]});
    }

    onEmailClick(): void {
        let idAppUser = this.topicForm.get("idAppUser").value;
        if(!idAppUser) {
            this.dialogService.alert("There is no owner selected for this topic. " +
                " Please select an owner in the dropdown and save before" +
                " trying to communicate through email.", null, DialogType.VALIDATION);
            return;
        }

        let saveFn = (data: any): Observable<boolean> => {
            data.format =  "text";
            data.idAppUser = idAppUser;

            let params: HttpParams = new HttpParams()
                .set("body", data.body)
                .set("format", data.format)
                .set("fromAddress", data.fromAddress)
                .set("idAppUser", data.idAppUser)
                .set("subject", data.subject);

            return this.topicService.emailTopicOwner(params).pipe(map((result) => {
                return result && result.result === "SUCCESS";
            }), (catchError((err: IGnomexErrorResponse) => {return throwError(err); })));
        };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "45em";
        configuration.height = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.disableClose = true;
        configuration.data = {
            saveFn: saveFn,
            action: "Email Topic Owner",
            parentComponent: "Topics",
            subjectText: "",
        };

        this.dialogService.genericDialogContainer(BasicEmailDialogComponent,
            "Email Topic Owner", this.constService.EMAIL_GO_LINK, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.EMAIL_GO_LINK, name: "Send", internalAction: "send"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]});
    }

    ngOnDestroy() {
        this.topicListNodeSubscription.unsubscribe();
        this.labChangesSubscription.unsubscribe();
    }
}
