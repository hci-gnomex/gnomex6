import {Component, Inject} from "@angular/core";

import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
	selector: "testing-dialog",
	templateUrl: "./testing-dialog.component.html",
	styleUrls: ["./testing-dialog.component.scss"],
}) export class TestingDialogComponent {

	constructor(public dialogRef: MatDialogRef<TestingDialogComponent>,
							@Inject(MAT_DIALOG_DATA) public data: any) { }

	onCloseClick(): void {
		this.dialogRef.close();
	}
}