import {Injectable, TemplateRef} from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';

import { Observable } from 'rxjs';

import { AlertDialogComponent } from "./alert-dialog.component";
import { SpinnerDialogComponent } from "./spinner-dialog.component";
import {CustomDialogComponent} from "./custom-dialog.component";
import {GenericContainerDialogComponent} from "./generic-container-dialog.component";
import {GDActionConfig} from "../interfaces/generic-dialog-action.model";

export enum DialogType {
    ERROR = "Error",
    WARNING = "Warning",
    ALERT = "Alert",
    SUCCESS = "Succeed",
    FAILED = "Failed",
    CONFIRM = "Confirm",
    INFO = "Info",
    VALIDATION = "Validation Error",
}

@Injectable()
export class DialogsService {

    private _spinnerDialogIsOpen: boolean = false;

    public spinnerDialogRefs: MatDialogRef<SpinnerDialogComponent>[] = [];

    public get spinnerDialogIsOpen(): boolean {
        return true && this._spinnerDialogIsOpen;
    }

    constructor(private dialog: MatDialog) { }

    public alert(message: string|string[], title?: string, dialogType?: DialogType, icon?: string, config?: MatDialogConfig): Observable<boolean> {
        return this.openDialog(message, title, dialogType ? dialogType : DialogType.ALERT, icon, config);
    }

    public confirm(message: string|string[], title?: string, icon?: string, config?: MatDialogConfig): Observable<boolean> {
        return this.openDialog(message, title, DialogType.CONFIRM, icon, config);

    }

    public error(message: string|string[], title?: string, icon?: string, config?: MatDialogConfig): Observable<boolean> {
        return this.openDialog(message, title, DialogType.ERROR, icon, config);
    }

    public info(message: string|string[], title?: string, icon?: string, config?: MatDialogConfig): Observable<boolean> {
        return this.openDialog(message, title, DialogType.INFO, icon, config);
    }

    public createCustomDialog(tempRef: TemplateRef<any>, title?: string, icon?: string, config?: MatDialogConfig) {
        let configuration: MatDialogConfig = null;
        if (!config) {
            configuration = new MatDialogConfig();
        } else {
            configuration = config;
        }

        configuration.data = configuration.data ? configuration.data : {};
        configuration.data["templateRef"] = tempRef;
        configuration.data["title"] = title ? title : "";
        configuration.data["icon"] = icon ? icon : "";

        configuration.minWidth = configuration.minWidth ?  configuration.minWidth : "10em";
        configuration.width = configuration.width ? configuration.width : "30em";

        configuration.panelClass = "no-padding";
        configuration.disableClose = true;
        configuration.hasBackdrop = false;

        let dialogRef = this.dialog.open(CustomDialogComponent, configuration);
        return dialogRef.afterClosed();
    }

    public startDefaultSpinnerDialog(): MatDialogRef<SpinnerDialogComponent> {
        return this.startSpinnerDialog('Loading...', 3, 30);
    }

    public startSpinnerDialog(message: string, strokeWidth: number, diameter: number): MatDialogRef<SpinnerDialogComponent> {
        if (this._spinnerDialogIsOpen) {
            return null;
        }

        this._spinnerDialogIsOpen = true;

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = {
            message: message,
            strokeWidth: strokeWidth,
            diameter: diameter
        };
        configuration.width = '13em';
        configuration.disableClose = true;

        let dialogRef: MatDialogRef<SpinnerDialogComponent> = this.dialog.open(SpinnerDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => { this._spinnerDialogIsOpen = false; });

        this.spinnerDialogRefs.push(dialogRef);

        return dialogRef;
    }

    // Let there be an alternative, global way to stop all active spinner dialogs.
    public stopAllSpinnerDialogs(): void {
        for (let dialogRef of this.spinnerDialogRefs) {
            setTimeout(() => {
                dialogRef.close();
            });
        }
    }

    public genericDialogContainer(dialogContent:any,title:string,icon?:string,
                                  config?:MatDialogConfig, actionConfig?:GDActionConfig):Observable<any> {
        let configuration: MatDialogConfig = null;


        if (!config) {
            configuration = new MatDialogConfig();
        } else {
            configuration = config;
        }
        configuration.data = configuration.data ? configuration.data : {};
        configuration.data["dialogContent"] = dialogContent;
        configuration.data["title"] = title;
        if(icon){
            configuration.data["icon"] = icon;
        }
        if(actionConfig){
            configuration.data["actionConfig"] = actionConfig;
        }
        configuration.panelClass = "no-padding";
        configuration.disableClose = true;
        configuration.hasBackdrop = false;
        let dialogRef = this.dialog.open(GenericContainerDialogComponent, configuration );

        return dialogRef.afterClosed();
    }

    private openDialog(message: string|string[], title?: string, type?: DialogType, icon?: string, config?: MatDialogConfig): Observable<any> {
        let configuration: MatDialogConfig = null;
        if (!config) {
            configuration = new MatDialogConfig();
        } else {
            configuration = config;
        }

        configuration.data = configuration.data ? configuration.data : {};
        configuration.data["message"] = message;
        configuration.data["title"] = title ? title : "";
        configuration.data["icon"] = icon ? icon : "";
        configuration.data["dialogType"] = type ? type : "";

        configuration.maxWidth = configuration.maxWidth ? configuration.maxWidth : "35em";
        configuration.minWidth = configuration.minWidth ?  configuration.minWidth : "10em";
        configuration.width = configuration.width ? configuration.width : "30em";

        configuration.panelClass = "no-padding";
        configuration.disableClose = true;
        configuration.autoFocus = false;
        configuration.hasBackdrop = false;

        let dialogRef: MatDialogRef<AlertDialogComponent>;

        dialogRef = this.dialog.open(AlertDialogComponent, configuration);

        return dialogRef.afterClosed();
    }


}
