import {Component, Inject } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

@Component({
	selector: "edit-billing-account-error-dialog",
	templateUrl: "./edit-billing-account-error-dialog.component.html",
	styles: [`			
			.center {
					text-align: center;
			}
	`]
})
export class EditBillingAccountErrorDialogComponent {

	errorMessage: string = '';

	constructor(private dialogRef: MatDialogRef<EditBillingAccountErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		this.errorMessage = !!data ? data.errorMessage : '';
	}

	private errorOkButtonClicked(): void {
		this.dialogRef.close();
	}

}