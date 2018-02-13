/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DictionaryService} from "../services/dictionary.service";
import {UserService} from "../services/user.service";

@Component({
    selector: 'new-user-dialog',
    templateUrl: "./new-user-dialog.html",
})

export class NewUserDialogComponent implements OnInit{
    private firstName: string = "";
    private lastName: string = "";

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewUserDialogComponent>,
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
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }


}
