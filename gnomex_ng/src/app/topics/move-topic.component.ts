import {Component, Inject} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";
import {TopicService} from "../services/topic.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'move-topic',
    template: `
        <div class="flex-container-col full-width full-height">
            <div class="full-width full-height double-padded">
                Do you want to move or copy items to {{targetFolder}}?
            </div>
            <div class="flex-container-row justify-flex-end generic-dialog-footer-colors">
                <save-footer (saveClicked)="doMoveCopy('M')" name="Move"></save-footer>
                <save-footer (saveClicked)="doMoveCopy('C')" name="Copy"></save-footer>
                <save-footer [actionType]="actionType" (saveClicked)="doCancel()" name="Cancel"></save-footer>
            </div>
        </div>
    `,
})

export class MoveTopicComponent extends BaseGenericContainerDialog {
    public actionType: any = ActionType.SECONDARY ;
    public currentItem: any;
    public targetItem: any;
    public targetFolder: any;

    constructor(public dialogRef: MatDialogRef<MoveTopicComponent>,
                private topicService: TopicService,
                private dialogService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.currentItem = data.currentItem;
        this.targetItem = data.targetItem;
        this.targetFolder = this.targetItem.label;
    }

    public doCancel(): void {
        this.dialogRef.close(false);
    }

    public doMoveCopy(mode: any): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams();
        if (mode === "M") {
            params = params.set("isMove", "Y");
        } else {
            params = params.set("isMove", "N");
        }
        if (this.currentItem.idParentTopic) {
            params = params.set("idParentTopicNew", this.targetItem.idTopic);
            params = params.set("idTopic", this.currentItem.idTopic);
            params = params.set("name", "Topic");
            this.topicService.moveOrCopyTopic(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } else {
            params = params.set("idTopic", this.targetItem.idTopic);
            params = params.set("idTopicOld", this.currentItem.idTopic);
            if (this.currentItem.idAnalysis) {
                params = params.set("name", "Analysis");
                params = params.set("idAnalysis0", this.currentItem.idAnalysis);
            } else if (this.currentItem.idRequest) {
                params = params.set("name", "Request");
                params = params.set("idRequest0", this.currentItem.idRequest);
            } else if (this.currentItem.idDataTrack) {
                params = params.set("name", "DataTrack");
                params = params.set("idDataTrack0", this.currentItem.idDataTrack);
            }
            this.topicService.addItemToTopic(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.topicService.refreshTopicsList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }

    }

}
