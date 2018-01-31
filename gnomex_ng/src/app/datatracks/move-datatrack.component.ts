import {Component, Inject} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'move-data-track',
    templateUrl: "./move-datatrack-dialog.html",
})

export class MoveDataTrackComponent {
    private selectedItem: ITreeNode;
    public title: string = "";
    private idGenomeBuild: string = "";

    public folderName: string = "";
    public idLab: string = "";
    public currentItem: any;
    public targetItem: any;
    public showSpinner: boolean = false;
    public items: any[] = [];
    public noButton: boolean = true;
    private targetFolder: any;

    constructor(public dialogRef: MatDialogRef<MoveDataTrackComponent>,
                private dataTrackService: DataTrackService,
                private dialogsService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

            this.currentItem = data.currentItem;
            this.targetItem = data.targetItem;
            this.targetFolder = this.targetItem.label;
            if (this.targetItem.idGenomeBuild !== this.currentItem.idGenomeBuild) {
                this.dialogsService.confirm("Cannot move data track to a different genome build", "");
                this.doCancel();
                this.dialogRef.close();
            }
    }

    public doCancel(): void {
        console.log("");
        this.noButton = true;
    }

    public doMoveCopy(mode: any): void {
        this.showSpinner = true;
        this.noButton = false;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idGenomeBuild", this.currentItem.idGenomeBuild);
        if (mode ==="M") {
            params.set("isMove", "Y");
        }
        else {
            params.set("isMove", "N");
        }
        if (this.currentItem.isDataTrackFolder) {
            params.set("idDataTrackFolder", this.currentItem.idDataTrackFolder);
            params.set("idParentDataTrackFolder", this.targetItem.idDataTrackFolder);
            params.set("name", "DataTrackFolder");
            this.dataTrackService.moveDataTrackFolder(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close();
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        } else {
            params.set("idDataTrack", this.currentItem.idDataTrack);
            params.set("idDataTrackFolder", this.targetItem.idDataTrackFolder);
            params.set("idDataTrackFolderOld", this.currentItem.idDataTrackFolder);
            this.dataTrackService.moveDataTrack(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.dialogRef.close();
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        }
    }

}
