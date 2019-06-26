import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import {ExperimentsService} from "./experiments.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'reassign-experiment-dialog',
    templateUrl: 'reassign-experiment-dialog.html'
})

export class ReassignExperimentComponent {
    public showSpinner: boolean = false;
    private selectedItem: any;
    private currentItemId: any;
    private idProject: any;
    private reassignExperimentForm: FormGroup;
    private showBillingCombo: boolean = false;
    private billingAccounts: any;
    private labMembers: any;
    private currentItem: any;
    private targetItem: any;
    public noButton: boolean = true;

    constructor(private dialogRef: MatDialogRef<ReassignExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
                private dialogService: DialogsService,
                private formBuilder: FormBuilder) {
        this.selectedItem = data.selectedItem;
        this.currentItemId = data.currentItemId;
        this.idProject = data.idProject;
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
            selectedOwner: ['', [
                Validators.required
            ]]
        });
        if (this.showBillingCombo) {
            this.reassignExperimentForm.addControl("selectedAccount", new FormControl("", Validators.required));
        }
    }

    reassignYesButtonClicked() {
        this.noButton = false;
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

    reassignNoButtonClicked() {
        this.noButton = true;
    }

    saveRequestProject(params: HttpParams) {
        this.showSpinner = true;
        this.experimentsService.saveRequestProject(params).pipe(first())
            .subscribe(response => {
                this.experimentsService.refreshProjectRequestList_fromBackend();
                console.log("saveprojectrequest " + response);
            }, () => {
                this.showSpinner = false;
            });

    }

}
