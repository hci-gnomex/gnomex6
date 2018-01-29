import {Component, Inject} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {TopicService} from "../services/topic.service";

@Component({
    selector: 'move-topic',
    templateUrl: "./move-topic-dialog.html",
})

export class MoveTopicComponent {
    public title: string = "";
    public folderName: string = "";
    public idLab: string = "";
    public currentItem: any;
    public targetItem: any;
    public showSpinner: boolean = false;
    public items: any[] = [];
    public noButton: boolean = true;
    private targetFolder: any;

    constructor(public dialogRef: MatDialogRef<MoveTopicComponent>,
                private topicService: TopicService,
                private dialogService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

        this.currentItem = data.currentItem;
        this.targetItem = data.targetItem;
        this.targetFolder = this.targetItem.label;
    }

    public doCancel(): void {
        console.log("");
        this.noButton = true;
    }

    public doMoveCopy(mode: any): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        if (mode ==="M")
            params.set("isMove", "Y");
        else {
            params.set("isMove", "N");
        }
        if (this.currentItem.idParentTopic) {
            params.set("idParentTopicNew", this.targetItem.idTopic);
            params.set("idTopic", this.currentItem.idTopic);
            params.set("name", "Topic");
            this.topicService.moveOrCopyTopic(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close();
                this.topicService.refreshTopicsList_fromBackend();
            });
        } else {
            params.set("idTopic", this.targetItem.idTopic);
            params.set("idTopicOld", this.currentItem.idTopic);
            if (this.currentItem.idAnalysis) {
                params.set("name", "Analysis");
                params.set("idAnalysis0", this.currentItem.idAnalysis);
            } else if (this.currentItem.idRequest) {
                params.set("name", "Request");
                params.set("idRequest0", this.currentItem.idRequest);
            } else if (this.currentItem.idDataTrack) {
                params.set("name", "DataTrack");
                params.set("idDataTrack0", this.currentItem.idDataTrack);
            }
            this.topicService.addItemToTopic(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close();
                this.topicService.refreshTopicsList_fromBackend();
            });
        }

    }

}
