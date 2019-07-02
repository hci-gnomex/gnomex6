import {Component, Inject, OnInit} from "@angular/core";
import {URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

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
        let params: URLSearchParams = new URLSearchParams();
        if (this.idLab) {
            params.set("idLab", this.idLab);
        }

        this.labListService.generateUserAccountEmail(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }

}
