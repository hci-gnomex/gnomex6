import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {UserPreferencesService} from "../../services/user-preferences.service";

@Component({
    selector: "add-additional-accounts",
    templateUrl: "./add-additional-accounts.component.html",
    styles: [``]
})
export class AddAdditionalAccountsComponent implements OnInit {

    private idLab_selected: any;

    private labList: any[];
    public labList_filtered: any[] = [];

    public allAuthorizedBillingAccounts: any[];
    public allAuthorizedBillingAccounts_filtered: any[] = [];

    public selectedLab:     any = null;
    public selectedAccount: any = null;

    constructor(public prefService: UserPreferencesService,
                private dialogRef: MatDialogRef<AddAdditionalAccountsComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {

        if (data) {
            if (data.idLab) {
                this.idLab_selected = data.idLab;
            }
            if (data.allAuthorizedBillingAccounts && data.allAuthorizedBillingAccounts.Lab && Array.isArray(data.allAuthorizedBillingAccounts.Lab)) {
                this.allAuthorizedBillingAccounts = data.allAuthorizedBillingAccounts.Lab;

                let temp: any[]  = [];

                for (let lab of this.allAuthorizedBillingAccounts) {
                    if (lab.BillingAccount) {
                        temp.push(lab);
                    }
                }

                this.labList_filtered = temp.sort(AddAdditionalAccountsComponent.sortBySortOrderThenName);
            }
        }
    }

    ngOnInit(): void {}

    public primaryDisable(): boolean {
        return false;
    }

    public dirty(): boolean {
        return false;
    }

    public selectLabOption(event: any): void {

        this.selectedLab = event;

        let temp: any[] = [];

        if (event && event.BillingAccount) {
            if (Array.isArray(event.BillingAccount)) {
                temp = event.BillingAccount;
            } else {
                temp.push(event.BillingAccount);
            }
        }

        this.allAuthorizedBillingAccounts_filtered = temp.sort(AddAdditionalAccountsComponent.sortBySortOrderThenAccountNameDisplay);
    }

    public selectBillingAccount(event: any): void {
        this.selectedAccount = event;
    }

    public addAdditionalAccount(): void {
        if (this.selectedAccount) {
            this.dialogRef.close({
                selectedAccount: this.selectedAccount,
                selectedLab: this.selectedLab,
                accountsForLab: this.allAuthorizedBillingAccounts_filtered
            });
        } else {
            this.dialogRef.close();
        }
    }

    public static sortBySortOrderThenName(obj1, obj2): number{
        if ((obj1 === null || obj1 === undefined) && (obj2 === null || obj2 === undefined)) {
            return 0;
        } else if (obj1 === null || obj1 === undefined) {
            return 1;
        } else if (obj2 === null || obj2 === undefined) {
            return -1;
        } else {
            let sortOrder1: number = obj1.sortOrder === "" ? 999 : +obj1.sortOrder;
            let sortOrder2: number = obj2.sortOrder === "" ? 999 : +obj2.sortOrder;

            if (sortOrder1 < sortOrder2) {
                return -1;
            } else if (sortOrder1 > sortOrder2) {
                return 1;
            } else {
                if ((obj1.name === null || obj1.name === undefined)
                    && (obj2.name === null || obj2.name === undefined)) {
                    return 0;
                } else if (obj1.name === null || obj1.name === undefined) {
                    return 1;
                } else if (obj2.name === null || obj2.name === undefined) {
                    return -1;
                } else {
                    return obj1.name.toUpperCase().localeCompare(obj2.name.toUpperCase());
                }
            }
        }
    }

    public static sortBySortOrderThenAccountNameDisplay(obj1, obj2): number{
        if ((obj1 === null || obj1 === undefined) && (obj2 === null || obj2 === undefined)) {
            return 0;
        } else if (obj1 === null || obj1 === undefined) {
            return 1;
        } else if (obj2 === null || obj2 === undefined) {
            return -1;
        } else {
            let sortOrder1: number = obj1.sortOrder === "" ? 999 : +obj1.sortOrder;
            let sortOrder2: number = obj2.sortOrder === "" ? 999 : +obj2.sortOrder;

            if (sortOrder1 < sortOrder2) {
                return -1;
            } else if (sortOrder1 > sortOrder2) {
                return 1;
            } else {
                if ((obj1.accountNameDisplay === null || obj1.accountNameDisplay === undefined)
                    && (obj2.accountNameDisplay === null || obj2.accountNameDisplay === undefined)) {
                    return 0;
                } else if (obj1.accountNameDisplay === null || obj1.accountNameDisplay === undefined) {
                    return 1;
                } else if (obj2.accountNameDisplay === null || obj2.accountNameDisplay === undefined) {
                    return -1;
                } else {
                    return obj1.accountNameDisplay.toUpperCase().localeCompare(obj2.accountNameDisplay.toUpperCase());
                }
            }
        }
    }
}