/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";

@Component({
    selector: 'drag-drop-hint-dialog',
    templateUrl: 'drag-drop-hint-dialog.html'
})

export class DragDropHintComponent {
    constructor(private dialogRef: MatDialogRef<DragDropHintComponent>
    ) {
    }

}
