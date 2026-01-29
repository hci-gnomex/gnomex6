import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Component, Inject} from "@angular/core";
import {ExperimentsService} from "./experiments.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: "reassign-experiment-dialog",
    template: `
        <form [formGroup]="reassignExperimentForm" class="flex-container-col full-width full-width padded-left-right">
            <p class="double-padded">Reassign experiment <strong>{{currentItem.label}}</strong> to project <strong>{{targetItem.label}}</strong>? </p>
            <div class="double-padded-left-right">
                <custom-combo-box [options]="this.labMembers"
                                  placeholder="Owner"
                                  [displayField]="'displayName'"
                                  valueField="idAppUser"
                                  [formControlName]="'selectedOwner'">
                </custom-combo-box>
            </div>

            <div *ngIf="showBillingCombo" class="double-padded-left-right">
                <custom-combo-box [options]="this.billingAccounts"
                                  placeholder="Account"
                                  [displayField]="'accountNameAndNumber'"
                                  valueField="idBillingAccount"
                                  [formControlName]="'selectedAccount'">
                </custom-combo-box>
            </div>
        </form>
    `,
})

export class ReassignExperimentComponent extends BaseGenericContainerDialog {

    public reassignExperimentForm: FormGroup;
    public showBillingCombo: boolean = false;
    public billingAccounts: any;
    public labMembers: any;
    public currentItem: any;
    public targetItem: any;
    public primaryDisable: (action?: GDAction) => boolean;

    constructor(private dialogRef: MatDialogRef<ReassignExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
                private dialogService: DialogsService,
                private formBuilder: FormBuilder) {
        super();
        this.billingAccounts = data.billingAccounts;
        this.labMembers = data.labMembers;
        this.currentItem =  data.currentItem;
        this.targetItem = data.targetItem;
        this.showBillingCombo = data.showBillingCombo;
        this.createForm();
    }

    /**
     * Create the project form.
     */
    createForm() {
        this.reassignExperimentForm = this.formBuilder.group({
            selectedOwner: ["", Validators.required]
        });
        if (this.showBillingCombo) {
            this.reassignExperimentForm.addControl("selectedAccount", new FormControl("", Validators.required));
        }
        this.primaryDisable = (action) => {
            return this.reassignExperimentForm.invalid;
        };
    }

    reassignYesButtonClicked() {
        let params: HttpParams = new HttpParams()
            .set("idRequest", this.currentItem.idRequest)
            .set("idProject", this.targetItem.idProject)
            .set("isExtermal", this.currentItem.isExternal)
            .set("idAppUser", this.reassignExperimentForm.get("selectedOwner").value);
        let idBillingAccount: string = "";
        if (this.showBillingCombo) {
            idBillingAccount = this.reassignExperimentForm.get("selectedAccount").value;
        }
        params = params.set("idBillingAccount", idBillingAccount);
        this.saveRequestProject(params);
    }

    saveRequestProject(params: HttpParams) {
        this.showSpinner = true;
        this.experimentsService.saveRequestProject(params).pipe(first())
            .subscribe(response => {
                this.showSpinner = false;
                this.dialogRef.close(true);
                this.experimentsService.refreshProjectRequestList_fromBackend();
                console.log("saveprojectrequest " + response);
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });

    }

}
