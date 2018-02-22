/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {GetLabService} from "../services/get-lab.service";

@Component({
    selector: 'new-group-dialog',
    templateUrl: "./delete-group-dialog.html",
})

export class DeleteGroupDialogComponent implements OnInit{
    public rebuildGroups: boolean = false;
    public showSpinner: boolean = false;
    private idLab: string = "";
    private groupName: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteGroupDialogComponent>,
                private getLabService: GetLabService,
                @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.idLab = data.idLab;
        this.groupName = data.labName;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idLab", this.idLab);

        this.getLabService.deleteLab(params).subscribe((response: Response) => {
            this.rebuildGroups = true;
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }


}
