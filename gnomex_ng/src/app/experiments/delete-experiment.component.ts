/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {ExperimentsService} from "./experiments.service";

@Component({
    selector: 'delete-experiment-dialog',
    templateUrl: 'delete-experiment-dialog.html'
})

export class DeleteExperimentComponent {
    public showSpinner: boolean = false;
    private selectedExperiment: any;

    constructor(private dialogRef: MatDialogRef<DeleteExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
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
        var params: URLSearchParams = new URLSearchParams();
        params.set("idRequest", this.selectedExperiment.idRequest);
        var ePromise = this.experimentsService.deleteExperiment(params).toPromise();
        ePromise.then(response => {
            this.experimentsService.refreshProjectRequestList_fromBackend();
        })
    }
}