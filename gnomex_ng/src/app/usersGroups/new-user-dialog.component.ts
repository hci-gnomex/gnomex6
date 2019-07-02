import {Component, OnInit} from "@angular/core";
import {URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

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
        let params: URLSearchParams = new URLSearchParams();
        params.set("idAppUser", '0');
        params.set("firstName", this.firstName);
        params.set("lastName", this.lastName);
        params.set("codeUserPermissionKind", 'LAB');
        params.set("isActive", 'N');
        params.set("isWebForm", 'N');

        this.userService.saveAppUser(params).subscribe((response: any) => {
            this.showSpinner = false;
            if (response.status === 200) {
                this.dialogRef.close(true);
                this.dialogsService.confirm("The user has been saved but is inactive. You must fill in login information and activate the user before the user can login.", null)
                    .subscribe(answer => {
                    });
            }
            this.dialogRef.close();
        });
    }


}
