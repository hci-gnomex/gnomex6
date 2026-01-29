import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatButtonModule  } from '@angular/material';

import {AngularMaterialModule} from "../../../modules/angular-material.module";

import { AlertDialogComponent } from './alert-dialog.component';
import { DialogsService } from './dialogs.service';
import { SpinnerDialogComponent } from "./spinner-dialog.component";
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
        SpinnerDialogComponent,
        CustomDialogComponent
    ],
    declarations: [
        AlertDialogComponent,
        SpinnerDialogComponent,
        CustomDialogComponent,
        GenericContainerDialogComponent
    ],
    providers: [
        DialogsService
    ],
    entryComponents: [
        AlertDialogComponent,
        SpinnerDialogComponent,
        CustomDialogComponent,
        GenericContainerDialogComponent
    ],
})
export class DialogsModule { }
