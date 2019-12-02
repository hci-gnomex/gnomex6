import {Component, Inject} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {TopicService} from "../services/topic.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: "delete-topic",
    template: `
        <div class="double-padded">
            {{deletePrompt}}
        </div>
    `,
})

export class DeleteTopicComponent extends BaseGenericContainerDialog {
    private selectedItem: ITreeNode;
    public deletePrompt: string = "";
    public showSpinner: boolean = false;
    private topic: any;
    private readonly unLink: boolean = false;
    private readonly type: string = "";
    private readonly deleteId: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteTopicComponent>,
                private dialogsService: DialogsService,
                private topicService: TopicService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.selectedItem = data.selectedItem;
        this.topic = data.topic;
        if (!this.selectedItem.data.idDataTrack && !this.selectedItem.data.idAnalysis && !this.selectedItem.data.idRequest) {
            this.deletePrompt = "Deleting topic '" + this.selectedItem.data.label + " will also remove all descendant topics " +
                "and links to experiments, analyses, and data tracks." + " Are you sure you want to delete the topic and all of its contents?";
            this.unLink = false;
        } else {
            if (this.selectedItem.data.idDataTrack) {
                this.deletePrompt = "Remove link to data track  " + this.selectedItem.data.label + " under topic " + this.topic.label + "?";
                this.type = "idDataTrack";
                this.deleteId = this.selectedItem.data.idDataTrack;
            } else if (this.selectedItem.data.idAnalysis) {
                this.deletePrompt = "Remove link to analysis  " + this.selectedItem.data.label + " under topic " + this.topic.label + "?";
                this.type = "idAnalysis";
                this.deleteId = this.selectedItem.data.idAnalysis;
            } else if (this.selectedItem.data.idRequest) {
                this.deletePrompt = "Remove link to experiment  " + this.selectedItem.data.label + " under topic " + this.topic.label + "?";
                this.type = "idRequest";
                this.deleteId = this.selectedItem.data.idRequest;
            }
            this.unLink = true;
        }
    }

    public delete(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams();
        if (this.unLink) {
            params = params.set("idTopic", this.selectedItem.data.idTopic);
            params = params.set(this.type, this.deleteId);
            this.topicService.unlinkItemFromTopic(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } else {
            params = params.set("idTopic", this.selectedItem.data.idTopic);
            this.topicService.deleteTopic(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }
}
