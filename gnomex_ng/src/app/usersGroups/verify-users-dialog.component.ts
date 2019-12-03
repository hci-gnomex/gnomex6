import {Component, Inject, OnInit} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: "verify-users-dialog",
    template: `
        <div class="padded">
            <div *ngIf="!idLab;else lab">
                GNomEx will send an email to all groups to verify the active user accounts.
                <br>
                Do you wish to continue?
            </div>
            <ng-template #lab>
                <div>
                    GNomEx will send an email to {{labName}} to verify the active user accounts.
                    <br>
                    Do you wish to continue?
                </div>
            </ng-template>
        </div>
    `,
})

export class VerifyUsersDialogComponent extends BaseGenericContainerDialog implements OnInit {
    public idLab: string = "";
    public labName: string = "";

    constructor(public dialogRef: MatDialogRef<VerifyUsersDialogComponent>,
                private labListService: LabListService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.idLab = data.idLab;
        this.labName = data.labName;
    }

    ngOnInit() {

    }

    public verify(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.idLab ? this.idLab : "");

        this.labListService.generateUserAccountEmail(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close();
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

}
