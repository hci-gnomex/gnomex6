import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import {ExperimentsService} from "./experiments.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'delete-experiment-dialog',
    template: `
        <div class="double-padded">
            {{this.selectedExperiment.number}}?
        </div>
    `
})

export class DeleteExperimentComponent extends BaseGenericContainerDialog {
    public showSpinner: boolean = false;
    public selectedExperiment: any;

    constructor(private dialogRef: MatDialogRef<DeleteExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogService: DialogsService,
                private experimentsService: ExperimentsService) {
        super();
        if(!this.data) {
            this.dialogRef.close();
        }
        this.selectedExperiment = data.selectedExperiment;
    }

    /**
     * Delete the experiment.
     */
    deleteExperiment() {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idRequest", this.selectedExperiment.idRequest);
        this.experimentsService.deleteExperiment(params).pipe(first())
            .subscribe(response => {
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
