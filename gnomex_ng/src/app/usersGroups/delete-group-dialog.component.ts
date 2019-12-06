import {Component, Inject, OnInit} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'new-group-dialog',
    template: `
        <div class="double-padded">
            <p>Delete {{groupName}}?</p>
        </div>
    `,
})

export class DeleteGroupDialogComponent extends BaseGenericContainerDialog implements OnInit{
    public groupName: string = "";
    private readonly idLab: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteGroupDialogComponent>,
                private getLabService: GetLabService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.idLab = data.idLab;
        this.groupName = data.labName;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.idLab);

        this.getLabService.deleteLab(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close(true);
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }


}
