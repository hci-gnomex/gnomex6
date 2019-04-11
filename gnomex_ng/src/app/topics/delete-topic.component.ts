import {Component, Inject} from "@angular/core";
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {TopicService} from "../services/topic.service";

@Component({
    selector: "delete-topic",
    template: `
        <h6 mat-dialog-title><img src="../../assets/folder_group.png">Confirm</h6>
        <mat-dialog-content>
            {{deletePrompt}}
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button *ngIf="!showSpinner" (click)="delete()">Yes</button>
            <button mat-button *ngIf="!showSpinner" mat-dialog-close>No</button>
            <mat-spinner *ngIf="showSpinner" strokeWidth="3" [diameter]="30"></mat-spinner>
        </mat-dialog-actions>
    `,
})

export class DeleteTopicComponent {
    private selectedItem: ITreeNode;
    public title: string = "";
    public folderName: string = "";
    public idLab: string = "";
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
        let params: URLSearchParams = new URLSearchParams();
        if (this.unLink) {
            params.set("idTopic", this.selectedItem.data.idTopic);
            params.set(this.type, this.deleteId);
            this.topicService.unlinkItemFromTopic(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            });
        } else {
            params.set("idTopic", this.selectedItem.data.idTopic);
            this.topicService.deleteTopic(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            });
        }
    }
}
