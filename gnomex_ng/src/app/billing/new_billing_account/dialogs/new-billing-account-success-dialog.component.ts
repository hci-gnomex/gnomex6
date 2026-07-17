import {Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {BaseGenericContainerDialog} from "../../../util/popup/base-generic-container-dialog";

@Component({
	selector: "new-billing-account-success-dialog",
	template: `
		<div class="flex-container-col full-width full-height double-padded" role="dialog" aria-label="Billing account created successfully">
            <h3>
                Billing Account Added
            </h3>
            <p aria-live="polite">{{successMessage}}</p>
            <p>
                After the account information is reviewed and approved, you will be notified by email when
                experiment requests may be submitted using this account.
            </p>
		</div>
	`,
	styles: [``]
})
export class NewBillingAccountSuccessDialogComponent extends BaseGenericContainerDialog {

	public successMessage: string = "";

	constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
		super();
		this.successMessage = this.data ? this.data.successMessage : "";
	}
}
