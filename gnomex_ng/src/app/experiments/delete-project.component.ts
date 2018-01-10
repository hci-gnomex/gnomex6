/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {ProjectService} from "../services/project.service";
import {ExperimentsService} from "./experiments.service";

@Component({
    selector: 'delete-project-dialog',
    templateUrl: 'delete-project-dialog.html'
})

export class DeleteProjectComponent {
    public showSpinner: boolean = false;
    private selectedItem: any;

    constructor(private dialogRef: MatDialogRef<DeleteProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private projectService: ProjectService,
                private experimentsService: ExperimentsService) {
        this.selectedItem = data.selectedItem;
    }

    /**
     * The yes button was selected in the delete dialog.
     */
    deleteProjectYesButtonClicked() {
        this.deleteProject();
    }

    /**
     * Delete the project.
     */
    deleteProject() {
        this.showSpinner = true;
        var params: URLSearchParams = new URLSearchParams();
        params.set("idProject", this.selectedItem.id);

        var lPromise = this.projectService.deleteProject(params).toPromise();
        lPromise.then( response => {
            this.experimentsService.refreshProjectRequestList_fromBackend();
        });

    }
}