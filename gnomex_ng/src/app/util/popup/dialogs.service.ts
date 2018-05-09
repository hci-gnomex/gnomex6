import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';

import { Observable } from 'rxjs/Rx';

import { ConfirmDialog } from './confirm-dialog.component';
import { AlertDialogComponent } from "./alert-dialog.component";
import { YesNoDialogComponent } from "./yes-no-dialog.component";

@Injectable()
export class DialogsService {

    constructor(private dialog: MatDialog) { }

    public alert(message: string): Observable<boolean> {

        let dialogRef: MatDialogRef<AlertDialogComponent>;

        dialogRef = this.dialog.open(AlertDialogComponent, { width: '20em' });
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public confirm(title: string, message: string): Observable<boolean> {

        let dialogRef: MatDialogRef<ConfirmDialog>;

        dialogRef = this.dialog.open(ConfirmDialog, {width: '30em'});
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public yesNoDialog(message: string, parent: any, onYesFunctionName: string): Observable<boolean> {

        let dialogRef: MatDialogRef<YesNoDialogComponent>;

        dialogRef = this.dialog.open(YesNoDialogComponent, { width: '20em' });
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.parent = parent;
        dialogRef.componentInstance.onYesFunctionName = onYesFunctionName;

        return dialogRef.afterClosed();
    }
}
