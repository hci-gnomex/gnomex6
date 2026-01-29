import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";

@Component({
    selector: "core-sample-selector",
    templateUrl: "./core-sample-selector.component.html",
    styles: [``]
})
export class CoreSampleSelectorComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    private emToPxConversionRate: number = 13;

    private gridApi: any;

    private get columnDefs(): any[] {
        let temp: any[] = [];

        temp.push({
            headerName: "Matched Alias Type",
            field: "aliasType",
            width:    200,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 15 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: false
        });
        temp.push({
            headerName: "Matched Alias",
            field: "alias",
            width:    200,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 12 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: false
        });
        temp.push({
            headerName: "CORE Identification Number",
            field: "id",
            width:    200,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 12 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: false
        });
        temp.push({
            headerName: "Amount",
            field: "amount",
            width:    100,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            showZeroes: true,
            suppressSizeToFit: true
        });
        temp.push({
            headerName: "Amount Unit",
            field: "amountUnit.unit",
            width:    100,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: true
        });
        temp.push({
            headerName: "Tissue Type",
            field: "tissueType.tissueType",
            width:    100,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: true
        });
        temp.push({
            headerName: "Sample Type",
            field: "sampleType.sampleType",
            width:    100,
            // width:    5 * this.emToPxConversionRate,
            // minWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: true
        });

        return temp;
    }


    constructor(private dialogRef: MatDialogRef<CoreSampleSelectorComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {

        super();
    }

    public ngOnInit(): void { }
    public ngOnDestroy(): void { }

    public onClickCancel(): void {
        this.dialogRef.close();
    }

    public onClickLink(): void {
        if (this.gridApi && this.gridApi.getSelectedRows()) {
            this.dialogRef.close(this.gridApi.getSelectedRows());
        } else {
            this.dialogRef.close();
        }
    }


    public onSelectionChanged(event: any): void {
        // console.log("Option Selected!")
    }

    public onGridReady(event: any): void {
        if (event && event.api) {
            this.gridApi = event.api;

            this.gridApi.setColumnDefs(this.columnDefs);

            if (this.data && this.data.searchResults && Array.isArray(this.data.searchResults)) {
                this.gridApi.setRowData(this.data.searchResults);
            } else {
                this.gridApi.setRowData([]);
            }

            setTimeout(() => {
                event.api.sizeColumnsToFit();
            });
        }
    }

    public onGridSizeChanged(event: any) {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            setTimeout(() => {
                this.gridApi.sizeColumnsToFit();
            });
        }
    }

}