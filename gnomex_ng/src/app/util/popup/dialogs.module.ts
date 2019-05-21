import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatButtonModule  } from '@angular/material';

import {AngularMaterialModule} from "../../../modules/angular-material.module";

import { AlertDialogComponent } from './alert-dialog.component';
import { DialogsService } from './dialogs.service';
import { ConfirmDialog }   from './confirm-dialog.component';
import { SpinnerDialogComponent } from "./spinner-dialog.component";
import { YesNoDialogComponent } from "./yes-no-dialog.component";
import {CustomDialogComponent} from "./custom-dialog.component";
import {GenericContainerDialogComponent} from "./generic-container-dialog.component";
import {DynamicModule} from "ng-dynamic-component";
import {UtilModule} from "../util.module";

@NgModule({
    imports: [
        AngularMaterialModule,
        MatDialogModule,
        MatButtonModule,
        DynamicModule,
        CommonModule,
        UtilModule
    ],
    exports: [
        AlertDialogComponent,
        ConfirmDialog,
        SpinnerDialogComponent,
        YesNoDialogComponent,
        CustomDialogComponent
    ],
    declarations: [
        AlertDialogComponent,
        ConfirmDialog,
        SpinnerDialogComponent,
        YesNoDialogComponent,
        CustomDialogComponent,
        GenericContainerDialogComponent
    ],
    providers: [
        DialogsService
    ],
    entryComponents: [
        AlertDialogComponent,
        ConfirmDialog,
        SpinnerDialogComponent,
        YesNoDialogComponent,
        CustomDialogComponent,
        GenericContainerDialogComponent
    ],
})
export class DialogsModule { }
