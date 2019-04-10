/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {ExperimentsService} from "./experiments.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'delete-experiment-dialog',
    templateUrl: 'delete-experiment-dialog.html'
})

export class DeleteExperimentComponent {
    public showSpinner: boolean = false;
    private selectedExperiment: any;

    constructor(private dialogRef: MatDialogRef<DeleteExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogService: DialogsService,
                private experimentsService: ExperimentsService) {
        this.selectedExperiment = data.selectedExperiment;
    }

    /**
     * The yes button was selected in the delete dialog.
     */
    deleteExperimentYesButtonClicked() {
        this.deleteExperiment();
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
                this.experimentsService.refreshProjectRequestList_fromBackend();
            },(err:IGnomexErrorResponse) => {
                this.dialogService.alert(err.gError.message);
            })
    }
}