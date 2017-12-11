import {Component, Inject} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";

@Component({
    selector: 'delete-data-track',
    templateUrl: "./delete-datatrack-dialog.html",
})

export class DeleteDataTrackComponent {
    private selectedItem: ITreeNode;
    public title: string = "";
    private idGenomeBuild: string = "";

    public folderName: string = "";
    public idLab: string = "";

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<DeleteDataTrackComponent>,
                private dataTrackService: DataTrackService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

        this.selectedItem = data.selectedItem;
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idLab", this.idLab);
        params.set("idGenomeBuild", this.selectedItem.data.idGenomeBuild);
        params.set("name", this.folderName);
        if (this.selectedItem.data.idDataTrackFolder) {
            params.set("idParentDataTrackFolder", this.selectedItem.data.idDataTrackFolder)
        }

        this.dataTrackService.deleteDataTrack(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
            this.dataTrackService.refreshDatatracksList_fromBackend();
        });
    }

}
