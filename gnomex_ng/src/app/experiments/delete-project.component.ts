/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {ProjectService} from "../services/project.service";
import {ExperimentsService} from "./experiments.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'delete-project-dialog',
    templateUrl: 'delete-project-dialog.html'
})

export class DeleteProjectComponent {
    public showSpinner: boolean = false;
    private selectedItem: any;

    constructor(private dialogRef: MatDialogRef<DeleteProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private projectService: ProjectService,
                private dialogService: DialogsService,
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
        let params: HttpParams = new HttpParams()
            .set("idProject", this.selectedItem.data.idProject);

        this.projectService.deleteProject(params).subscribe( response => {
            this.experimentsService.refreshProjectRequestList_fromBackend();
        },(err:IGnomexErrorResponse)=>{
            this.showSpinner = false;
        });

    }
}