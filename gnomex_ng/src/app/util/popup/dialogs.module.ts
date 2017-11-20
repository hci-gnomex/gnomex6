import { DialogsService } from './dialogs.service';
import { MatDialogModule, MatButtonModule  } from '@angular/material';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialog }   from './confirm-dialog.component';

@NgModule({
    imports: [
        MatDialogModule,
        MatButtonModule,
        CommonModule
    ],
    exports: [
        ConfirmDialog,
    ],
    declarations: [
        ConfirmDialog,
    ],
    providers: [
        DialogsService,
    ],
    entryComponents: [
        ConfirmDialog,
    ],
})
export class DialogsModule { }