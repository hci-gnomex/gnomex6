/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {LabListService} from "../services/lab-list.service";

@Component({
    selector: 'verify-users-dialog',
    templateUrl: "./verify-users-dialog.html",
})

export class VerifyUsersDialogComponent implements OnInit{
    public rebuildUsers: boolean = false;
    public showSpinner: boolean = false;
    private idLab: string = "";
    private mode: string = "";

    constructor(public dialogRef: MatDialogRef<VerifyUsersDialogComponent>,
                private labListService: LabListService,
                @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.idLab = data.idLab;
    }

    ngOnInit() {
    }

    public verify(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        if (this.mode) {
            params.set("idLab", this.idLab);
        }

        this.labListService.generateUserAccountEmail(params).subscribe((response: Response) => {
            this.dialogRef.close();
        });
    }


}
