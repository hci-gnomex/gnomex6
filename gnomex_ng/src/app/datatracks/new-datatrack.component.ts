import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DictionaryService} from "../services/dictionary.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'new-datatrack-folder',
    templateUrl: "./new-datatrack-dialog.html",
})

export class NewDataTrackComponent implements OnInit{
    private selectedItem: ITreeNode;
    public title: string = "";
    private folder: string = "";
    public name: string = "";
    public idGenomeBuild: string = "";
    public idLab: string = "";
    public visibilityList: any[] = [];
    public labList: any[] = [];
    private codeVisibility: string = "";

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewDataTrackComponent>,
                private dataTrackService: DataTrackService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private dialogsService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {

        this.selectedItem = data.selectedItem;
        this.folder = this.selectedItem.data.label;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    ngOnInit() {
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY);
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
        let params: HttpParams = new HttpParams()
            .set("idLab", this.idLab)
            .set("idGenomeBuild", this.selectedItem.data.idGenomeBuild)
            .set("name", this.name)
            .set("codeVisibility", this.codeVisibility);
        if (this.selectedItem.data.idDataTrackFolder) {
            params = params.set("idDataTrackFolder", this.selectedItem.data.idDataTrackFolder);
        }

        this.dataTrackService.saveDataTrack(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                this.showSpinner = false;
                this.dialogRef.close();
                this.dataTrackService.refreshDatatracksList_fromBackend();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while saving data track" + message, null);
            }
        });
    }

    onVisibilitySelect(event: any) {
        this.codeVisibility = event.args.item.value;
    }

}
