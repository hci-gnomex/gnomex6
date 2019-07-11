import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: "delete-data-track",
    template: `
        <div class="double-padded">
            {{deletePrompt}}
        </div>
    `,
})

export class DeleteDataTrackComponent extends BaseGenericContainerDialog {
    private selectedItem: ITreeNode;

    public folderName: string = "";
    public idLab: string = "";
    public deletePrompt: string = "";
    public showSpinner: boolean = false;
    public hasLink: boolean;

    constructor(public dialogRef: MatDialogRef<DeleteDataTrackComponent>,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();

        this.selectedItem = data.selectedItem;
        if (this.selectedItem.data.folderCount > 1) {
            this.deletePrompt = "Remove reference to dataTrack '" + this.selectedItem.data.label +
                 "' under '" + this.selectedItem.parent.data.label + "'?";
            this.hasLink = true;
        } else {
            this.deletePrompt = "Delete dataTrack " + this.selectedItem.data.label + "'?";
            this.hasLink = false;
        }
    }

    public delete(): void {
        if (this.hasLink) {
            let params: HttpParams = new HttpParams();
            let dString: string = "";

            params = params.set("idDataTrack", this.selectedItem.data.idDataTrack);
            this.dataTrackService.getDataTrack(params).subscribe((response: any) => {
                let dataTrackFolders = response.DataTrackFolders.filter(folder => folder.name.indexOf(this.selectedItem.parent.data.name) === -1);
                for (var d of dataTrackFolders) {
                    dString = dString.concat(d.name.substring(d.name.indexOf("/")+1, d.name.length));
                    dString = dString.concat(",");
                }
                dString = dString.substring(0, dString.lastIndexOf(","));
                params = new HttpParams()
                    .set("idDataTrack", this.selectedItem.data.idDataTrack)
                    .set("idDataTrackFolder", this.selectedItem.data.idDataTrackFolder)
                    .set("idGenomeBuild", this.selectedItem.data.idGenomeBuild);

                this.dataTrackService.unlinkDataTrack(params).subscribe((response: any) => {

                    let confirmString: string = "DataTrack '" + this.selectedItem.data.label + "' is referenced under folders '" + dString + "'.";
                    confirmString = confirmString + "<br> Do you want to remove all references to this dataTrack?";

                    this.dialogsService
                        .confirm(confirmString)
                        .subscribe(
                            res => {
                                if (res) {
                                    this.deleteDataTrack();
                                }
                                this.dialogRef.close();
                                this.dataTrackService.refreshDatatracksList_fromBackend();
                            }
                        );
                });
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } else {
            this.showSpinner = true;
            this.deleteDataTrack();
        }
    }

    deleteDataTrack() {
        let params: HttpParams = new HttpParams()
            .set("idDataTrack", this.selectedItem.data.idDataTrack);
        this.dataTrackService.deleteDataTrack(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close();
            this.dataTrackService.refreshDatatracksList_fromBackend();
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });

    }
}
