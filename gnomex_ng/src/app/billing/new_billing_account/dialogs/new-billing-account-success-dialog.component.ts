import {Component, Inject } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";

@Component({
	selector: "new-billing-account-success-dialog",
	templateUrl: "./new-billing-account-success-dialog.component.html",
	styles: [`			
			.center {
					text-align: center;
			}
	`]
})
export class NewBillingAccountSuccessDialogComponent {

	successMessage: string = '';

	constructor(private dialogRef: MatDialogRef<NewBillingAccountSuccessDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		this.successMessage = !!data ? data.successMessage : '';
	}

	private successOkButtonClicked(): void {
		this.dialogRef.close();
	}

}