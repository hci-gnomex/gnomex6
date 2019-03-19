import {Component, Inject} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {TopicService} from "../services/topic.service";
import {LabListService} from "../services/lab-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {UserPreferencesService} from "../services/user-preferences.service";

@Component({
    selector: 'new-topic',
    templateUrl: "./new-topic.component.html",
})

export class NewTopicComponent {

    public title: string = "";
    private parentTopicLabel: string = "";

    private idParentTopic = "";
    public name: string = "";
    public idLab: string = "";
    public idOwner: string = "";

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
                @Inject(MAT_DIALOG_DATA) private data: any) {
        if (this.data != null) {
            this.selectedItem = data.selectedItem;
        }
        if (!this.selectedItem || !this.selectedItem.data.idTopic) {
            this.title = " Add New Top Level Topic";
        } else {
            this.title = " Add Subtopic of " + this.selectedItem.parent.data.label;
        }

        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    public onLabSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idLab = event.args.item.value;
                this.getLabService.getLabMembers(this.idLab).subscribe((response: any[]) => {
                    if (this.createSecurityAdvisorService.isAdmin || this.createSecurityAdvisorService.isSuperAdmin) {
                        this.ownerList = response;
                    } else {
                        this.ownerList = response.filter((user: any) => {
                            return user.idAppUser == this.createSecurityAdvisorService.idAppUser;
                        });
                    }
                });
            }
        } else {
            this.resetLabSelection();
        }
    }

    public onLabUnselect(): void {
        this.resetLabSelection();
    }

    private resetLabSelection(): void {
        this.idLab = "";
        this.ownerList = [];
        this.resetOwnerSelection();
    }

    public onOwnerSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idOwner = event.args.item.value;
            }
        } else {
            this.resetOwnerSelection();
        }
    }

    public onOwnerUnselect(): void {
        this.resetOwnerSelection();
    }

    private resetOwnerSelection(): void {
        this.idOwner = "";
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idParentTopic", this.selectedItem.data.idTopic);
        params.set("name", this.name);
        params.set("description", "");
        params.set("idLab", this.idLab);
        params.set("idAppUser", this.idOwner);
        params.set("codeVisibility", "MEM");
        this.topicService.saveTopic(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
            this.topicService.refreshTopicsList_fromBackend();
        });
    }

}
