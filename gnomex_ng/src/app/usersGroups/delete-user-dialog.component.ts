/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'new-user-dialog',
    templateUrl: "./delete-user-dialog.html",
})

export class DeleteUserDialogComponent implements OnInit{
    public rebuildUsers: boolean = false;
    public showSpinner: boolean = false;
    private idAppUser: string = "";
    private userName: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
                private dialogsService: DialogsService,
                private userService: UserService,
                @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.idAppUser = data.idAppUser;
        this.userName = data.userName;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idAppUser", this.idAppUser);

        this.userService.deleteAppUser(params).subscribe((response: Response) => {
            this.rebuildUsers = true;
            this.dialogRef.close();
        });
    }


}
