import {Component, Inject } from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material";
import {BaseGenericContainerDialog} from "../../../util/popup/base-generic-container-dialog";

@Component({
	selector: "edit-billing-account-error-dialog",
	template: `
        <div class="flex-container-col full-width full-height double-padded">
            <h3>
                Please fix the following errors with this form before proceeding:
            </h3>
            <div class="padded-left-right">
                <pre>{{errorMessage}}</pre>
            </div>
        </div>
	`,
	styles: [``]
})
export class EditBillingAccountErrorDialogComponent extends BaseGenericContainerDialog {

	errorMessage: string = "";

	constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
		super();
		this.errorMessage = this.data ? this.data.errorMessage : "";
	}

}
