/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'new-user-dialog',
    templateUrl: "./new-user-dialog.html",
})

export class NewUserDialogComponent implements OnInit{
    private firstName: string = "";
    private lastName: string = "";
    public rebuildUsers: boolean = false;
    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewUserDialogComponent>,
                private dialogsService: DialogsService,
                private userService: UserService,
                ) {

    }

    ngOnInit() {
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



        this.userService.saveAppUser(params).subscribe((response: Response) => {
            if (response.status === 200) {
                this.rebuildUsers = true;
                this.dialogsService.confirm("The user has been saved but is inactive. You must fill in login information and activate the user before the user can login.", null)
                    .subscribe(answer => {

                    })
            }
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }


}
