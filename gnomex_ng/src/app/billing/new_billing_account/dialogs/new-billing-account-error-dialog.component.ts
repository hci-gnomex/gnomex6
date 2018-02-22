import {Component, Inject } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

@Component({
	selector: "new-billing-account-error-dialog",
	templateUrl: "./new-billing-account-error-dialog.component.html",
	styles: [`			
			.center {
					text-align: center;
			}
	`]
})
export class NewBillingAccountErrorDialogComponent {

	errorMessage: string = '';

	constructor(private dialogRef: MatDialogRef<NewBillingAccountErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		this.errorMessage = !!data ? data.errorMessage : '';
	}

	private errorOkButtonClicked(): void {
		this.dialogRef.close();
	}

}