import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {DictionaryService} from "../services/dictionary.service";
import {ProductsService} from "../services/products.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {ConstantsService} from "../services/constants.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {
    BillingTemplate, BillingTemplateWindowComponent,
    BillingTemplateWindowParams
} from "../util/billing-template-window.component";
import {BillingService} from "../services/billing.service";
import {WorkAuthorizationTypeSelectorDialogComponent} from "./work-authorization-type-selector-dialog.component";
import {UserPreferencesService} from "../services/user-preferences.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'order-products',
    templateUrl: "./order-products.component.html",
    styles: [`
        .padded {
            padding: 0.5em;
        }
        .half-width {
            width: 50%;
        }
        td > * {
            vertical-align: middle;
        }
        img.description-icon {
            padding-left: 1em;
        }
        .left-padding {
            padding-left: 1em;
        }
        .user-input {
            background-color: gainsboro;
        }
        .justify-end {
            justify-content: flex-end;
        }
        .justify-space-between {
            justify-content: space-between;
        }
        .bold-font {
            font-weight: bold;
        }
        .padding-top {
            padding-top: 1em;
        }
        .padding-bottom {
            padding-bottom: 1em;
        }
    `]
})

export class OrderProductsComponent implements OnInit {

    public isAdminState: boolean = false;
    public showSplitBillingButton: boolean = false;
    public enableSubmit: boolean = false;
    public userConsent: boolean = false;

    public currentCoreFacility: any;
    public idLab: string;
    public lab: any;
    public idAppUser: string;
    public idBillingAccount: string;
    private billingTemplate: BillingTemplate;
    public grandTotal: number = 0;

    public labList: any[] = [];
    public userList: any[] = [];
    public billingAccountList: any[] = [];
    public productTypeList: any[] = [];
    public productList: ProductOrderItem[] = [];
    private labProductCounts: any[] = [];

    constructor(private route: ActivatedRoute,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                private labListService: LabListService,
                private getLabService: GetLabService,
                private dictionaryService: DictionaryService,
                private productsService: ProductsService,
                private dialogsService: DialogsService,
                private router: Router,
                private dialog: MatDialog,
                private billingService: BillingService,
                public prefService: UserPreferencesService,
                private constantsService: ConstantsService) {
    }

    ngOnInit() {
        this.isAdminState = this.createSecurityAdvisorService.isAdmin || this.createSecurityAdvisorService.isSuperAdmin;
        if (!this.isAdminState) {
            this.idAppUser = "" + this.createSecurityAdvisorService.idAppUser;
        }

        this.route.paramMap.forEach((map: ParamMap) => {
            this.idLab = "";
            if (this.isAdminState) {
                this.idAppUser = "";
            }
            this.showSplitBillingButton = false;
            this.idBillingAccount = "";
            this.billingTemplate = null;
            this.labList = [];
            this.onLabChange();
            this.productTypeList = [];
            this.productList = [];

            for (let core of this.createSecurityAdvisorService.myCoreFacilities) {
                if (core.idCoreFacility === map.get('idCoreFacility')) {
                    this.currentCoreFacility = core;
                    break;
                }
            }

            if (this.currentCoreFacility) {
                this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
                    this.labList = response.filter((lab: any) => {
                        let keep: boolean = false;

                        let labCores: any[] = Array.isArray(lab.coreFacilities) ? lab.coreFacilities : [lab.coreFacilities.CoreFacility];
                        for (let core of labCores) {
                            if (core.idCoreFacility === this.currentCoreFacility.idCoreFacility) {
                                keep = true;
                                break;
                            }
                        }
                        if (!keep) {
                            return false;
                        }

                        if (this.createSecurityAdvisorService.isCoreFacilityIManage(this.currentCoreFacility.idCoreFacility)) {
                            return true;
                        } else {
                            return lab.isMyLab === 'Y' || lab.canSubmitRequests === 'Y' || lab.canManage === 'Y';
                        }
                    });
                });

                this.productTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_TYPE).filter((pt: any) => {
                    return pt.idCoreFacility === this.currentCoreFacility.idCoreFacility;
                });

                let authorizedBillingAccountsParams: HttpParams = new HttpParams().set("idCoreFacility", this.currentCoreFacility.idCoreFacility);
                this.billingService.getAuthorizedBillingAccounts(authorizedBillingAccountsParams).subscribe((response: any) => {
                    this.showSplitBillingButton = response && response.hasAccountsWithinCore && response.hasAccountsWithinCore === 'Y';
                });
            }
        });
    }

    public onLabChange(): void {
        this.userList = [];
        this.billingAccountList = [];
        this.lab = null;
        this.labProductCounts = [];

        if (this.idLab) {
            this.getLabService.getLabById(this.idLab).subscribe((response: any) => {
                if (this.isAdminState) {
                    this.userList = Array.isArray(response.Lab.activeSubmitters) ? response.Lab.activeSubmitters : [response.Lab.activeSubmitters.AppUser];
                    this.userList = this.userList.filter((user: any) => { return user.idAppUser; });
                }
                this.billingAccountList = Array.isArray(response.Lab.authorizedBillingAccounts) ? response.Lab.authorizedBillingAccounts : [response.Lab.authorizedBillingAccounts.BillingAccount];

                this.lab = response.Lab;
                this.labProductCounts = Array.isArray(this.lab.productCounts) ? this.lab.productCounts : [this.lab.productCounts.product];

                this.productsService.getProductList().subscribe((response: any) => {
                    if (response && Array.isArray(response)) {
                        for (let p of response) {
                            for (let pt of this.productTypeList) {
                                if (pt.idProductType === p.idProductType) {
                                    p.isSelected = false;
                                    p.quantity = 0;
                                    p.unitPrice = this.getUnitPrice(p);
                                    if (!p.unitPrice) {
                                        continue;
                                    }
                                    p.total = 0;
                                    p.currentProductCount = this.getCurrentProductCount(p);
                                    this.productList.push(p);
                                    break;
                                }
                            }
                        }
                    }
                },(err:IGnomexErrorResponse) => {
                });
            }, (err:IGnomexErrorResponse) => {
            });
        }
    }

    private getUnitPrice(p: ProductOrderItem): string {
        if (!this.lab) {
            return "";
        }

        if (this.lab.isExternalPricing === 'Y') {
            return p.unitPriceExternalAcademic;
        } else if (this.lab.isExternalPricingCommercial === 'Y') {
            return p.unitPriceExternalCommercial;
        } else {
            return p.unitPriceInternal;
        }
    }

    private getCurrentProductCount(p: ProductOrderItem): string {
        for (let labProduct of this.labProductCounts) {
            if (p.idProduct === labProduct.idProduct) {
                return labProduct.qty;
            }
        }
        return "0";
    }

    public checkQuantity(p: ProductOrderItem): void {
        if (!p.quantity || p.quantity < 0) {
            p.quantity = 0;
        }
        p.quantity = Math.round(p.quantity);
        if (p.quantity > 0) {
            p.isSelected = true;
            p.total = p.quantity * parseInt(p.unitPrice);
        } else {
            p.isSelected = false;
            p.total = 0;
        }
        this.grandTotal = 0;
        this.enableSubmit = false;
        for (let p of this.productList) {
            this.grandTotal += p.total;
            if (p.isSelected && p.quantity > 0) {
                this.enableSubmit = true;
            }
        }
    }

    public submitOrder(): void {
        if (this.userConsent && this.enableSubmit) {
            this.enableSubmit = false;
            let params: HttpParams = new HttpParams()
                .set("noJSONToXMLConversionNeeded", "Y")
                .set("productListJSONString", JSON.stringify(this.productList.filter((item: ProductOrderItem) => { return item.isSelected })))
                .set("idAppUser", this.idAppUser)
                .set("idLab", this.idLab)
                .set("idCoreFacility", this.currentCoreFacility.idCoreFacility)
                .set("codeProductOrderStatus", ConstantsService.CODE_PRODUCT_ORDER_STATUS_NEW);
            if (this.billingTemplate) {
                params = params.set("billingTemplateJSONString", JSON.stringify(this.billingTemplate));
            } else {
                params = params.set("idBillingAccount", this.idBillingAccount);
            }
            this.productsService.saveProductOrder(params).subscribe((response: any) => {
                if (response && response.result && response.result === "SUCCESS") {
                    this.router.navigateByUrl('product-orders');
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.confirm("An error occurred while submitting the product order" + message, null);
                    this.enableSubmit = true;
                }
            });
        }
    }

    public showSubmitWorkAuthorization(): void {
        // TODO WorkAuthorizationTypeSelector
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width  = "40em";
        configuration.height = "30em";
        configuration.autoFocus = false;
        configuration.data = { idLab: "" + this.idLab };

        this.dialogsService.genericDialogContainer(WorkAuthorizationTypeSelectorDialogComponent, "New Billing Account (Choose Type)", null, configuration,
            {actions: [
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe(() => {
                    this.onLabChange();
        });
    }

    public showSplitBilling(): void {
        let params: BillingTemplateWindowParams = new BillingTemplateWindowParams();
        params.idCoreFacility = this.currentCoreFacility.idCoreFacility;
        if (this.billingTemplate) {
            params.billingTemplate = this.billingTemplate;
        }
        let config: MatDialogConfig = new MatDialogConfig();
        config.autoFocus = false;
        config.data = {
            params: params
        };

        this.dialogsService.genericDialogContainer(BillingTemplateWindowComponent, "Billing Template", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "promptToSave"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"},
                ]}).subscribe((result: any) => {
                    if (result) {
                        this.billingTemplate = result as BillingTemplate;
                        this.idBillingAccount = "";
                    }
        });
    }

    public cancelSplitBilling(): void {
        this.billingTemplate = null;
    }

}

interface ProductOrderItem {
    idProduct: string;
    isSelected: boolean;
    name: string;
    orderQty: string;
    quantity: number;
    unitPriceExternalAcademic: string;
    unitPriceExternalCommercial: string;
    unitPriceInternal: string;
    unitPrice: string;
    currentProductCount: string;
    description: string;
    total: number;
}
