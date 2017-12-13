/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {ProjectService} from "../services/project.service";
import {ExperimentsService} from "./experiments.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

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
    private selectedOwnerItem: any;
    private selectedBillingItem: any;
    private currentItem: any;
    private targetItem: any;
    public noButton: boolean = true;

    constructor(private dialogRef: MatDialogRef<ReassignExperimentComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
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


    /**
     * The yes button was selected in the delete dialog.
     */
    reassignYesButtonClicked() {
        this.noButton = false;
        var params: URLSearchParams = new URLSearchParams();
        params.set("idRequest", this.currentItem.id);
        params.set("idProject", this.targetItem.id);

        params.set("idAppUser", this.selectedOwnerItem.idAppUser);
        var idBillingAccount =  null;
        if (this.showBillingCombo === true) {
            idBillingAccount = this.selectedBillingItem.idBillingAccount;
        }
        params.set("idBillingAccount", idBillingAccount);
        this.saveRequestProject(params);

    }

    reassignNoButtonClicked() {
        this.noButton = true;
    }
    /**
     * Save the project request created in the reassign dialog
     * @param {URLSearchParams} params
     */
    saveRequestProject(params: URLSearchParams) {
        this.showSpinner = true;
        var lPromise = this.experimentsService.saveRequestProject(params).toPromise();
        lPromise.then(response => {
            this.experimentsService.refreshProjectRequestList_fromBackend();
            console.log("saveprojectrequest " + response);
        });

    }

    /**
     * Set the selected project lab.
     * @param event
     */
    onOwnerSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.selectedOwnerItem = event.args.item.originalItem;
        }
    }

    /**
     * Set the selected project lab.
     * @param event
     */
    onAccountSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.selectedBillingItem = event.args.item.originalItem;
        }
    }


    save(formData:any){
    console.log(formData);
}

}