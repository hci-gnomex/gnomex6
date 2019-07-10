import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BillingService} from "../services/billing.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode, SelectionChangedEvent} from "ag-grid-community";
import {FormBuilder, FormGroup} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'price-view',
    templateUrl: "./price-view.component.html",
    styles: [`
        div.grid-div {
            height: 15em;
            width: 100%;
        }
        .flex-one {
            flex: 1;
        }
    `]
})

export class PriceViewComponent extends BaseGenericContainerDialog implements OnInit {

    private allCriteria1: any[];
    private allCriteria2: any[];

    public innerTitle: string = "Price";
    public form: FormGroup;
    private idPrice: string = "0";
    private idPriceCategory: string;
    private idCoreFacility: string;

    private gridColDefs: any[];
    private gridApi: GridApi;
    public criteria: any[] = [];
    public selectedCriteria: RowNode = null;

    constructor(private dialogRef: MatDialogRef<PriceViewComponent>,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {
        super();
        this.form = fb.group({
            name: '',
            active: false,
            notes: '',
            unitPrice: '0',
            academicPrice: '0',
            commercialPrice: '0'
        });

    }

    ngOnInit() {
        this.idPriceCategory = this.data.idPriceCategory;
        this.idCoreFacility = this.data.idCoreFacility;
        if (this.data.idPrice) {
            this.billingService.getPrice(this.data.idPrice).subscribe((result: any) => {
                if (result && result.Price) {
                    let price: any = result.Price;
                    this.idPrice = price.idPrice;
                    this.form.controls['name'].setValue(price.name);
                    this.form.controls['active'].setValue(price.isActive === 'Y');
                    this.form.controls['notes'].setValue(price.description);
                    this.form.controls['unitPrice'].setValue(price.unitPrice ? price.unitPrice : '0');
                    this.form.controls['academicPrice'].setValue(price.unitPriceExternalAcademic ? price.unitPriceExternalAcademic : '0');
                    this.form.controls['commercialPrice'].setValue(price.unitPriceExternalCommercial ? price.unitPriceExternalCommercial : '0');
                    this.criteria = price.priceCriterias ? (Array.isArray(price.priceCriterias) ? price.priceCriterias : [price.priceCriterias.PriceCriteria]) : [];
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.error("An error occurred while retrieving the price" + message);
                }
            });
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        this.gridColDefs = [];
        this.allCriteria1 = [];
        this.allCriteria2 = [];
        this.billingService.getPriceCategory(this.idPriceCategory).subscribe((result: any) => {
            if (result && result.PriceCategory) {
                let priceCategory: any = result.PriceCategory;
                this.innerTitle += " (" + priceCategory.name + ")";

                if (priceCategory.dictionaryClassNameFilter1) {
                    if (priceCategory.dictionaryClassNameFilter1 === 'text') {
                        this.gridColDefs.push({headerName: "filter1", field: "filter1", editable: true, width: 100});
                    } else {
                        let dictionary1: any = this.dictionaryService.getDictionary(priceCategory.dictionaryClassNameFilter1);
                        this.allCriteria1 = this.dictionaryService.getEntriesExcludeBlank(priceCategory.dictionaryClassNameFilter1).filter((dict: any) => {
                            return dict.idCoreFacility ? dict.idCoreFacility === this.idCoreFacility : true;
                        });
                        this.gridColDefs.push(
                            {headerName: dictionary1.displayName, field: "filter1", editable: true, width: 100, cellRendererFramework: SelectRenderer,
                                cellEditorFramework: SelectEditor, selectOptions: this.allCriteria1, selectOptionsDisplayField: "display", selectOptionsValueField: "value"}
                        );
                    }
                }
                if (priceCategory.dictionaryClassNameFilter2) {
                    if (priceCategory.dictionaryClassNameFilter2 === 'text') {
                        this.gridColDefs.push({headerName: "filter2", field: "filter2", editable: true, width: 100});
                    } else {
                        let dictionary2: any = this.dictionaryService.getDictionary(priceCategory.dictionaryClassNameFilter2);
                        this.allCriteria2 = this.dictionaryService.getEntriesExcludeBlank(priceCategory.dictionaryClassNameFilter2).filter((dict: any) => {
                            return dict.idCoreFacility ? dict.idCoreFacility === this.idCoreFacility : true;
                        });
                        this.gridColDefs.push(
                            {headerName: dictionary2.displayName, field: "filter2", editable: true, width: 100, cellRendererFramework: SelectRenderer,
                                cellEditorFramework: SelectEditor, selectOptions: this.allCriteria2, selectOptionsDisplayField: "display", selectOptionsValueField: "value"}
                        );
                    }
                }
                event.api.setColumnDefs(this.gridColDefs);
                event.api.sizeColumnsToFit();
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.error("An error occurred while retrieving the price category" + message);
            }
        });
        this.gridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onGridSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedCriteria = event.api.getSelectedNodes()[0];
    }

    public addCriteria(): void {
        let newCriteria: any = {
            idPriceCriteria: "PriceCriteria",
            filter1: "",
            filter2: ""
        };
        this.criteria.push(newCriteria);
        this.gridApi.setRowData(this.criteria);
    }

    public removeCriteria(): void {
        if (this.selectedCriteria) {
            this.criteria.splice(this.selectedCriteria.rowIndex, 1);
            this.gridApi.setRowData(this.criteria);
            this.selectedCriteria = null;
        }
    }

    public save(): void {
        let params: HttpParams = new HttpParams()
            .set("name", this.form.controls['name'].value)
            .set("description", this.form.controls['notes'].value)
            .set("idPriceCategory", this.idPriceCategory)
            .set("idPrice", this.idPrice)
            .set("isActive", this.form.controls['active'].value ? "Y" : "N")
            .set("unitPrice", this.form.controls['unitPrice'].value ? this.form.controls['unitPrice'].value : '0')
            .set("unitPriceExternalAcademic", this.form.controls['academicPrice'].value ? this.form.controls['academicPrice'].value : '0')
            .set("unitPriceExternalCommercial", this.form.controls['commercialPrice'].value ? this.form.controls['commercialPrice'].value : '0')
            .set("priceCriteriasJSONString", JSON.stringify(this.criteria))
            .set("noJSONToXMLConversionNeeded", "Y");

        this.billingService.savePrice(params).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                this.dialogRef.close(true);
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.error("An error occurred while saving the price" + message);
            }
        });
    }

}
