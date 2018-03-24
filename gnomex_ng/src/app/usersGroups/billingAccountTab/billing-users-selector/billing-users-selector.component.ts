import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
	selector: "billing-users-selector",
	templateUrl: "billing-users-selector.component.html",
	styles: [``]
})
export class BillingUsersSelectorComponent {

	constructor(private dialogRef: MatDialogRef<BillingUsersSelectorComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		//this.successMessage = !!data ? data.successMessage : '';
	}

	okButtonClicked(): void {
		console.log("Ok clicked!");
		this.dialogRef.close();
	}
}