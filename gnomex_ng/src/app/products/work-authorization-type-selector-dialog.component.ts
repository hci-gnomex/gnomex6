import {Component, Inject} from "@angular/core";
import {GnomexService} from "../services/gnomex.service";
import {PropertyService} from "../services/property.service";
import {Router} from "@angular/router";
import {DialogsService} from "../util/popup/dialogs.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {NewBillingAccountComponent} from "../billing/new_billing_account/new-billing-account.component";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'work-authorization-type-selector-dialog',
    templateUrl: 'work-authorization-type-selector-dialog.component.html',
    styles: [`

        .title-size { font-size: large; }
        
        .no-padding { padding: 0; }
        .no-margin  { margin:  0; }

        .bordered { border: 1px solid silver; }
        
        .foreground { background-color: white; }
        .background { background-color: #eeeeeb; }

        .link-button {
            color: blue;
            text-decoration: underline;
        }
        
    `]
})
export class WorkAuthorizationTypeSelectorDialogComponent extends BaseGenericContainerDialog {

    public get showInternalButton(): boolean {
        return this.gnomexService && this.gnomexService.isCoreGenomics === true;
    }

    public gnomexButtonLabel: string;
    private gnomexButtonProperty: any;

    public gnomexButtonUrlLabel: string;
    private gnomexButtonUrlProperty: any;

    public coreOptions: any[];

    private idLab: string = '';

    constructor(private dialog: MatDialog,
                private dialogService: DialogsService,
                private gnomexService: GnomexService,
                private dialogRef: MatDialogRef<WorkAuthorizationTypeSelectorDialogComponent>,
                private propertyService: PropertyService,
                private router:Router,
                private constService: ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();

        if (this.data && this.data.idLab) {
            this.idLab = this.data.idLab;
        }

        this.gnomexButtonProperty    = this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_NAME);
        this.gnomexButtonUrlProperty = this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_URL);

        this.gnomexButtonLabel    = this.gnomexButtonProperty    && this.gnomexButtonProperty.propertyValue    ? this.gnomexButtonProperty.propertyValue    : null;
        this.gnomexButtonUrlLabel = this.gnomexButtonUrlProperty && this.gnomexButtonUrlProperty.propertyValue ? this.gnomexButtonUrlProperty.propertyValue : null;

        this.coreOptions = [];

        for (let coreFacility of this.gnomexService.myCoreFacilities) {
            let tempNameProperty: any = this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_ALT_GNOMEX_NAME, coreFacility.idCoreFacility);
            let tempUrlProperty:  any = this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_ALT_GNOMEX_URL,  coreFacility.idCoreFacility);

            if (tempNameProperty
                && tempNameProperty.propertyValue
                && tempUrlProperty
                && tempUrlProperty.propertyValue) {

                let tempOption: any = {
                    label: '' + tempNameProperty.propertyValue,
                    url  : '' + tempUrlProperty.propertyValue
                };

                this.coreOptions.push(tempOption);
            }
        }

        // If there is only one option, then automatically choose that option.
        if (this.coreOptions.length === 0) {
            this.onClickInternalButton();
        } else if (this.coreOptions.length === 1
            && !this.gnomexService.isUniversityUserAuthentication
            && !this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_URL)) {

            this.goToUrl(this.coreOptions[0].url);
        }
    }

    public onClickInternalButton(): void {
        // If this gnomex installation supports university user authentication,
        // show window that allows user to enter work auth form directly; otherwise,
        // show URL that is a printable work auth form.
        if (this.gnomexService.isUniversityUserAuthentication) {
            // parentApplication.showWorkAuthWindow(lab == null ? null : lab.@idLab, coreFacility == null ? null : coreFacility.@idCoreFacility);

            let config: MatDialogConfig = new MatDialogConfig();
            config.width = '60em';
            config.autoFocus = false;
            config.data = { idLab: "" + this.idLab };

            this.dialogService.genericDialogContainer(NewBillingAccountComponent, "Submit Campus Billing Account", this.constService.ICON_WORK_AUTH_FORM, config,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "onSaveButtonClicked"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});
        } else {
            let url: string = this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_URL);
            if (url) {
                this.router.navigateByUrl(this.propertyService.getProperty(PropertyService.PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_URL));
            } else {
                this.dialogService.alert("The properties needed to use this feature have not been set. Please contact a system admin.", "ERROR");
            }
        }

        this.dialogRef.close();
    }

    public goToUrl(url: string): void {
        if (url) {
            window.open(url, "_blank");
        }

        this.dialogRef.close();
    }
}
