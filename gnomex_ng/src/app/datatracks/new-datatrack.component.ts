/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DictionaryService} from "../services/dictionary.service";

@Component({
    selector: 'new-datatrack-folder',
    templateUrl: "./new-datatrack-dialog.html",
})

export class NewDataTrackComponent implements OnInit{
    private selectedItem: ITreeNode;
    public title: string = "";
    private idGenomeBuild: string = "";
    private folder: string = "";
    public name: string = "";
    public idLab: string = "";
    private visibilityList: any[] = [];
    public labList: any[] = [];
    private codeVisibility: string = "";

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewDataTrackComponent>,
                private dataTrackService: DataTrackService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

        this.selectedItem = data.selectedItem;
        this.folder = this.selectedItem.data.label;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });

    }

    ngOnInit() {
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILTY);
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
        params.set("name", this.name);
        params.set("codeVisibility", this.codeVisibility);
        if (this.selectedItem.data.idDataTrackFolder) {
            params.set("idDataTrackFolder", this.selectedItem.data.idDataTrackFolder)
        }

        this.dataTrackService.saveDataTrack(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
            this.dataTrackService.refreshDatatracksList_fromBackend();
        });
    }

    onVisibilitySelect(event: any) {
        this.codeVisibility = event.args.item.value;
    }


}
