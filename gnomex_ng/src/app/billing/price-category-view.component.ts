import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BillingService} from "../services/billing.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode, SelectionChangedEvent} from "ag-grid";
import {FormBuilder, FormGroup} from "@angular/forms";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: 'price-category-view',
    templateUrl: "./price-category-view.component.html",
    styles: [`
        div.grid-div {
            height: 300px;
            width: 400px;
        }
    `]
})

export class PriceCategoryViewComponent implements OnInit {

    private allSteps: any[];
    private allChargeKinds: any[];
    private allFilterTypes: any[];

    public title: string = "Price Category";
    public form: FormGroup;
    private idPriceCategory: string = "0";
    private idPriceSheet: string;

    private gridColDefs: any[];
    private gridApi: GridApi;
    public steps: any[] = [];
    public selectedStep: RowNode = null;

    constructor(private dialogRef: MatDialogRef<PriceCategoryViewComponent>,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {

        this.allSteps = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.STEP).filter((s: any) => {
            return s.value && s.isActive && s.isActive !== 'N';
        });
        this.allChargeKinds = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_CHARGE_KIND);
        this.allFilterTypes = this.dictionaryService.getAllDictionaries();
        this.allFilterTypes.push({
            displayName: "Qty (range)",
            className: "text"
        });

        this.gridColDefs = [
            {headerName: "Workflow Steps", field: "codeStep", editable: true, width: 100, cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.allSteps, selectOptionsDisplayField: "step",
                selectOptionsValueField: "codeStep"},
        ];

        this.form = fb.group({
            name: '',
            active: false,
            notes: '',
            chargeKind: '',
            filter1: '',
            filter2: '',
            plugin: ''
        });
    }

    ngOnInit() {
        this.idPriceSheet = this.data.idPriceSheet;
        if (this.data.idPriceCategory) {
            this.billingService.getPriceCategory(this.data.idPriceCategory).subscribe((result: any) => {
                if (result && result.PriceCategory) {
                    let priceCategory: any = result.PriceCategory;
                    this.title += " " + priceCategory.name;
                    this.idPriceCategory = priceCategory.idPriceCategory;
                    this.form.controls['name'].setValue(priceCategory.name);
                    this.form.controls['active'].setValue(priceCategory.isActive === 'Y');
                    this.form.controls['notes'].setValue(priceCategory.description);
                    this.form.controls['chargeKind'].setValue(priceCategory.codeBillingChargeKind);
                    this.form.controls['filter1'].setValue(priceCategory.dictionaryClassNameFilter1);
                    this.form.controls['filter2'].setValue(priceCategory.dictionaryClassNameFilter2);
                    this.form.controls['plugin'].setValue(priceCategory.pluginClassName);
                    this.steps = priceCategory.steps ? (Array.isArray(priceCategory.steps) ? priceCategory.steps : [priceCategory.steps.Step]) : [];
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.confirm("An error occurred while retrieving the price category" + message, null);
                }
            });
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.gridColDefs);
        event.api.sizeColumnsToFit();
        this.gridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onGridSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedStep = event.api.getSelectedNodes()[0];
    }

    public addStep(): void {
        let newStep: any = {
            step: "",
            codeStep: ""
        };
        this.steps.push(newStep);
        this.gridApi.setRowData(this.steps);
    }

    public removeStep(): void {
        if (this.selectedStep) {
            this.steps.splice(this.selectedStep.rowIndex, 1);
            this.gridApi.setRowData(this.steps);
            this.selectedStep = null;
        }
    }

    public save(): void {
        let params: HttpParams = new HttpParams()
            .set("name", this.form.controls['name'].value)
            .set("description", this.form.controls['notes'].value)
            .set("idPriceCategory", this.idPriceCategory)
            .set("idPriceSheet", this.idPriceSheet)
            .set("isActive", this.form.controls['active'].value ? "Y" : "N")
            .set("pluginClassName", this.form.controls['plugin'].value)
            .set("stepsJSONString", JSON.stringify(this.steps))
            .set("noJSONToXMLConversionNeeded", "Y");
        if (this.form.controls['filter1'].value) {
            params = params.set("dictionaryClassNameFilter1", this.form.controls['filter1'].value)
        }
        if (this.form.controls['filter2'].value) {
            params = params.set("dictionaryClassNameFilter2", this.form.controls['filter2'].value)
        }
        if (this.form.controls['chargeKind'].value) {
            params = params.set("codeBillingChargeKind", this.form.controls['chargeKind'].value)
        }

        this.billingService.savePriceCategory(params).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                this.dialogRef.close(true);
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while saving the price category" + message, null);
            }
        });
    }

}
