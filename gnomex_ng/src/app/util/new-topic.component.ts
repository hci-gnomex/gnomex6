import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {TopicService} from "../services/topic.service";
import {LabListService} from "../services/lab-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "./popup/dialogs.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {GDAction} from "./interfaces/generic-dialog-action.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IGnomexErrorResponse} from "./interfaces/gnomex-error.response.model";

@Component({
    selector: "new-topic",
    templateUrl: "./new-topic.component.html",
})

export class NewTopicComponent extends BaseGenericContainerDialog {

    public form: FormGroup;
    public primaryDisable: (action?: GDAction) => boolean;

    public labList: any[] = [];
    public ownerList: any[] = [];

    public showSpinner: boolean = false;
    private selectedItem: ITreeNode;

    constructor(public dialogRef: MatDialogRef<NewTopicComponent>,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private getLabService: GetLabService,
                private topicService: TopicService,
                private labListService: LabListService,
                public prefService: UserPreferencesService,
                private dialogService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private fb: FormBuilder) {
        super();
        this.form = this.fb.group({
            name: ["", [Validators.required, Validators.maxLength(2000)]],
            idLab: ["", [Validators.required]],
            idAppUser: ["", [Validators.required]],
        });

        if (this.data != null) {
            this.selectedItem = data.selectedItem;
        }

        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });

        this.form.markAsPristine();
        this.primaryDisable = (action) => {
            return this.form.invalid;
        };
    }

    public onLabSelect(): void {
        this.ownerList = [];
        let idLab: string = this.form.get("idLab").value;
        if (idLab) {
            this.getLabService.getLabMembers(idLab).subscribe((response: any[]) => {
                if (this.createSecurityAdvisorService.isAdmin || this.createSecurityAdvisorService.isSuperAdmin) {
                    this.ownerList = response;
                } else {
                    this.ownerList = response.filter((user: any) => {
                        return user.idAppUser === this.createSecurityAdvisorService.idAppUser;
                    });
                }
            });
        }
    }

    public save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idParentTopic", this.selectedItem.data.idTopic ? this.selectedItem.data.idTopic : "")
            .set("name", this.form.get("name").value)
            .set("description", "")
            .set("idLab", this.form.get("idLab").value)
            .set("idAppUser", this.form.get("idAppUser").value)
            .set("codeVisibility", "MEM");
        this.topicService.saveTopic(params).subscribe((result: any) => {
            this.showSpinner = false;
            if (result && result.result === "SUCCESS") {
                this.dialogRef.close(result.idTopic);
                this.topicService.refreshTopicsList_fromBackend();
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

}
