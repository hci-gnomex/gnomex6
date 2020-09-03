import {Component, OnInit} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {MatDialogRef} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: "new-user-dialog",
    template: `
        <div class="flex-container-col full-width full-height double-padded">
            <mat-form-field class="dialogFormField">
                <input matInput [(ngModel)]="firstName" placeholder="First name">
            </mat-form-field>
            <mat-form-field class="dialogFormField">
                <input matInput [(ngModel)]="lastName" placeholder="Last name">
            </mat-form-field>
        </div>
    `,
})

export class NewUserDialogComponent extends BaseGenericContainerDialog implements OnInit {
    public firstName: string = "";
    public lastName: string = "";

    constructor(public dialogRef: MatDialogRef<NewUserDialogComponent>,
                private dialogsService: DialogsService,
                private userService: UserService) {
        super();
    }

    ngOnInit() {
        this.primaryDisable = (action) => !this.firstName || !this.lastName;
    }

    public save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("idAppUser", "0")
            .set("firstName", this.firstName)
            .set("lastName", this.lastName)
            .set("codeUserPermissionKind", "LAB")
            .set("isActive", "N")
            .set("isWebForm", "N");

        this.userService.saveAppUser(params).subscribe((response: any) => {
            this.showSpinner = false;
            if (response && response.idAppUser) {
                this.dialogRef.close(response.idAppUser);
                this.dialogsService.alert("The user has been saved but is inactive. You must fill in login information and activate the user before the user can login.");
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }


}
