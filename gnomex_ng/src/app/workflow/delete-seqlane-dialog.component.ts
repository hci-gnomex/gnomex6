/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {WorkflowService} from "../services/workflow.service";

@Component({
    selector: 'delete-seqlane-dialog',
    templateUrl: "./delete-seqlane-dialog.html",
})

export class DeleteSeqlaneDialogComponent implements OnInit{
    private showSpinner: boolean = false;
    public rebuildSeqlanes: boolean = false;
    private seqLanes: string = "";
    private laneLength: number;
    private laneString: string;

    constructor(public dialogRef: MatDialogRef<DeleteSeqlaneDialogComponent>,
                private workflowService: WorkflowService,
                @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.seqLanes = data.seqLanes;
        this.laneLength = data.laneLength;
        this.laneString = data.laneString;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("workItemIds", this.seqLanes);

        this.workflowService.deleteWorkItem(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.rebuildSeqlanes = true;
            this.dialogRef.close();
        });
    }


}
