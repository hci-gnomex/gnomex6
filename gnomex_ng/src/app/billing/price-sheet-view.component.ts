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
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'price-sheet-view',
    templateUrl: "./price-sheet-view.component.html",
    styles: [`
        div.grid-div {
            height: 15em;
            width: 100%;
        }
    `]
})

export class PriceSheetViewComponent extends BaseGenericContainerDialog implements OnInit {
    private allExperimentPlatforms: any[];

    public innerTitle: string = "Price Sheet";
    public form: FormGroup;
    private idPriceSheet: string = "0";

    private gridColDefs: any[];
    private gridApi: GridApi;
    public experimentPlatforms: any[] = [];
    public selectedExperimentPlatform: RowNode = null;

    constructor(private dialogRef: MatDialogRef<PriceSheetViewComponent>,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {
        super();

        this.allExperimentPlatforms = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.gridColDefs = [
            {headerName: "Experiment Platform", field: "codeRequestCategory", editable: true, width: 100, cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.allExperimentPlatforms, selectOptionsDisplayField: "display",
                selectOptionsValueField: "codeRequestCategory"},
        ];

        this.form = fb.group({
            name: '',
            active: false,
            notes: ''
        });
    }

    ngOnInit() {
        if (this.data && this.data.idPriceSheet) {
            this.billingService.getPriceSheet(this.data.idPriceSheet).subscribe((result: any) => {
                if (result && result.PriceSheet) {
                    let priceSheet: any = result.PriceSheet;
                    this.innerTitle += " " + priceSheet.name;
                    this.idPriceSheet = priceSheet.idPriceSheet;
                    this.form.controls['name'].setValue(priceSheet.name);
                    this.form.controls['active'].setValue(priceSheet.isActive === 'Y');
                    this.form.controls['notes'].setValue(priceSheet.description);
                    this.experimentPlatforms = priceSheet.requestCategories ? (Array.isArray(priceSheet.requestCategories) ? priceSheet.requestCategories : [priceSheet.requestCategories.RequestCategory]) : [];
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.error("An error occurred while retrieving the price sheet" + message);
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
        this.selectedExperimentPlatform = event.api.getSelectedNodes()[0];
    }

    public addExperimentPlatform(): void {
        let newRequestCategory: any = {
            display: "",
            codeRequestCategory: ""
        };
        this.experimentPlatforms.push(newRequestCategory);
        this.gridApi.setRowData(this.experimentPlatforms);
    }

    public removeExperimentPlatform(): void {
        if (this.selectedExperimentPlatform) {
            this.experimentPlatforms.splice(this.selectedExperimentPlatform.rowIndex, 1);
            this.gridApi.setRowData(this.experimentPlatforms);
            this.selectedExperimentPlatform = null;
        }
    }

    public save(): void {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("name", this.form.controls['name'].value)
            .set("description", this.form.controls['notes'].value)
            .set("idPriceSheet", this.idPriceSheet)
            .set("isActive", this.form.controls['active'].value ? "Y" : "N")
            .set("requestCategoriesJSONString", JSON.stringify(this.experimentPlatforms))
            .set("noJSONToXMLConversionNeeded", "Y");

        this.billingService.savePriceSheet(params).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                this.dialogRef.close(true);
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.error("An error occurred while saving the price sheet" + message);
            }
        });
    }

}
