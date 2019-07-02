import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {WorkflowService} from "../services/workflow.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: "delete-seqlane-dialog",
    template: `
        <div class="padded">
            <p>You are about to delete {{laneLength}} sequence {{laneString}}. <br>Continue?</p>
        </div>
    `,
})

export class DeleteSeqlaneDialogComponent extends BaseGenericContainerDialog implements OnInit{

    public laneLength: number;
    public laneString: string;
    private readonly seqLanes: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteSeqlaneDialogComponent>,
                private workflowService: WorkflowService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.seqLanes = data.seqLanes;
        this.laneLength = data.laneLength;
        this.laneString = data.laneString;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("workItemIds", this.seqLanes);

        this.workflowService.deleteWorkItem(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close(true);
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }


}
