/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {UserPreferencesService} from "../services/user-preferences.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'new-datatrack-folder',
    templateUrl: "./new-datatrackfolder-dialog.html",
})

export class NewDataTrackFolderComponent {
    private selectedItem: ITreeNode;
    public title: string = "";
    private idGenomeBuild: string = "";

    public folderName: string = "";
    public idLab: string = "";
    private item: string = "";
    public labList: any[] = [];

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewDataTrackFolderComponent>,
                private dataTrackService: DataTrackService,
                private labListService: LabListService,
                public prefService: UserPreferencesService,
                private dialogService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

        this.selectedItem = data.selectedItem;
        this.item = this.selectedItem.data.label;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });

    }

    public onLabSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idLab = event.args.item.value;
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

        this.dataTrackService.saveDataTrackFolder(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
            this.dataTrackService.refreshDatatracksList_fromBackend();
        },(err: IGnomexErrorResponse) => {
            this.showSpinner = false;
            this.dialogService.alert(err.gError.message);
        });
    }

}
