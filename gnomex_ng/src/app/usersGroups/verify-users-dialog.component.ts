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
    public showSpinner: boolean = false;
    private idLab: string = "";
    private labName: string = "";

    constructor(public dialogRef: MatDialogRef<VerifyUsersDialogComponent>,
                private labListService: LabListService,
                @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
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

        this.labListService.generateUserAccountEmail(params).subscribe((response: Response) => {
            this.dialogRef.close();
        });
    }

}
