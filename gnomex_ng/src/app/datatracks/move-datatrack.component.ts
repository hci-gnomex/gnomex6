import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: "move-data-track",
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

export class MoveDataTrackComponent extends BaseGenericContainerDialog {

    public actionType: any = ActionType.SECONDARY ;
    public targetFolder: any;
    private currentItem: any;
    private targetItem: any;

    constructor(public dialogRef: MatDialogRef<MoveDataTrackComponent>,
                private dataTrackService: DataTrackService,
                private dialogsService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();

        if(this.data) {
            this.currentItem = data.currentItem;
            this.targetItem = data.targetItem;
            this.targetFolder = this.targetItem.label;
            if (this.targetItem.idGenomeBuild !== this.currentItem.idGenomeBuild) {
                this.dialogsService.confirm("Cannot move data track to a different genome build", "");
                this.doCancel();
            }
        }
    }

    public doCancel(): void {
        this.dialogRef.close(false);
    }

    public doMoveCopy(mode: any): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams();
        params = params.set("idGenomeBuild", this.currentItem.idGenomeBuild);
        if (mode === "M") {
            params = params.set("isMove", "Y");
        } else {
            params = params.set("isMove", "N");
        }
        if (this.currentItem.isDataTrackFolder) {
            params = params.set("idDataTrackFolder", this.currentItem.idDataTrackFolder);
            params = params.set("idParentDataTrackFolder", this.targetItem.idDataTrackFolder);
            params = params.set("name", "DataTrackFolder");
            this.dataTrackService.moveDataTrackFolder(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.dataTrackService.refreshDatatracksList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } else {
            params = params.set("idDataTrack", this.currentItem.idDataTrack);
            params = params.set("idDataTrackFolder", this.targetItem.idDataTrackFolder);
            params = params.set("idDataTrackFolderOld", this.currentItem.idDataTrackFolder);
            this.dataTrackService.moveDataTrack(params).subscribe((response: any) => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.dataTrackService.refreshDatatracksList_fromBackend();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }

}
