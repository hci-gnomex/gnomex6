import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Component, Inject} from "@angular/core";
import {ProjectService} from "../services/project.service";
import {ExperimentsService} from "./experiments.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: "delete-project-dialog",
    template: `
        <div class="double-padded">
            {{selectedItem.data.label}}?
        </div>
    `
})

export class DeleteProjectComponent extends BaseGenericContainerDialog {
    public showSpinner: boolean = false;
    public selectedItem: any;

    constructor(private dialogRef: MatDialogRef<DeleteProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private projectService: ProjectService,
                private dialogService: DialogsService,
                private experimentsService: ExperimentsService) {
        super();
        if(!this.data) {
            this.dialogRef.close();
        }
        this.selectedItem = data.selectedItem;
    }


    /**
     * Delete the project.
     */
    public deleteProject() {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idProject", this.selectedItem.data.idProject);

        this.projectService.deleteProject(params).subscribe( response => {
            this.showSpinner = false;
            this.dialogRef.close(true);
            this.experimentsService.refreshProjectRequestList_fromBackend();
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });

    }

    cancel(): void {
        this.dialogRef.close();
    }

}
