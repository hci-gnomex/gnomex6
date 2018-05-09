import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatButtonModule  } from '@angular/material';

import { AlertDialogComponent } from './alert-dialog.component';
import { DialogsService } from './dialogs.service';
import { ConfirmDialog }   from './confirm-dialog.component';
import { YesNoDialogComponent } from "./yes-no-dialog.component";

@NgModule({
    imports: [
        MatDialogModule,
        MatButtonModule,
        CommonModule
    ],
    exports: [
        AlertDialogComponent,
        ConfirmDialog,
        YesNoDialogComponent
    ],
    declarations: [
        AlertDialogComponent,
        ConfirmDialog,
        YesNoDialogComponent
    ],
    providers: [
        DialogsService,
    ],
    entryComponents: [
        AlertDialogComponent,
        ConfirmDialog,
        YesNoDialogComponent
    ],
})
export class DialogsModule { }
