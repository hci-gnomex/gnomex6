import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { URLSearchParams } from "@angular/http";

import { TextAlignLeftMiddleRenderer } from "../../../util/grid-renderers/text-align-left-middle.renderer";

import * as _ from "lodash";

@Component({
    selector: "multiple-select-dialog",
    templateUrl: "multiple-select-dialog.component.html",
    styles: [`
			.full-width  { width  : 100%; }
			.full-height { height : 100%; }
			
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.flex-vertical-container {
					display: flex;
					flex-direction: column;
			}
			
			.stretch {
					flex: 1;
			}
			
			.vertical-center { vertical-align: middle; }
			.center { text-align: center; }
            .inline-block { display: inline-block; }
			
			.no-margin { margin : 0; }

			.horizontal-padding { padding: 0 1em; }
			
			.left-align  { text-align: left;  }
			.right-align { text-align: right; }
			
			.error-message { color: red; }
	`]
})
export class MultipleSelectDialogComponent {

    value: string;
    okWasClicked: boolean = false;

    displayField: string;
    valueField: string;

    options: any[];
    optionName: string;

    columnDefinitions: any[];

    gridApi: any;
    gridColumnApi: any;

    allowMultipleSelection: boolean = true;
    gridRowSelection: string = 'multiple';

    constructor(private dialogRef: MatDialogRef<MultipleSelectDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        this.optionName   = 'Option';
        this.displayField = 'display';
        this.valueField   = 'value';
        this.options      = [];

        this.allowMultipleSelection = true;

        if (this.data) {
            this.value        = "" + this.data.value;
            this.optionName   = "" + this.data.optionName;
            this.displayField = "" + this.data.displayField;
            this.valueField   = "" + this.data.valueField;

            if ((typeof this.data.allowMultipleSelection) !== undefined && !this.data.allowMultipleSelection) {
                this.allowMultipleSelection = false;
            }
            this.gridRowSelection = !!this.allowMultipleSelection ? 'multiple' : 'single';

            if (this.data.options) {
                if (Array.isArray(this.data.options)) {
                    this.options = this.data.options;
                } else {
                    this.options = [this.data.options];
                }
            }
        }
    }

    assignGridContents(): void {
        if (this.gridApi) {
            let shownGridData;

            if (this.options) {
                shownGridData = _.cloneDeep(this.options);

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [ shownGridData.DictionaryEntry ];
                }
            } else {
                shownGridData = [];
            }

            this.gridApi.setColumnDefs(this.getColumnDefinitions());
            this.gridApi.setRowData(shownGridData);

            this.selectRowData();
        }
    }

    getColumnDefinitions(): any[] {
        this.columnDefinitions = [];
        if (this.allowMultipleSelection) {
            this.columnDefinitions.push({
                width: 25,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: false
            });
        }
        this.columnDefinitions.push({
            headerName: this.optionName,
            editable:  false,
            width:  100,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: this.displayField
        });

        return this.columnDefinitions;
    }

    selectRowData(): void {
        if (this.gridApi && this.valueField) {
            this.gridApi.forEachNode((node) => {
                if(node.data) {
                    let tokens = this.value.trim().split(/,/);

                    for (let token of tokens) {
                        if (token === node.data[this.valueField]) {
                            node.setSelected(true);
                        }
                    }
                }
            });
        }
    }

    getValue(): string {
        if (!this.okWasClicked) {
            return this.value;
        }

        let result: string = '';
        if (this.gridApi) {
            let first: boolean = true;

            for (let node of this.gridApi.getSelectedNodes()) {
                if (node && node.data) {
                    if (first) {
                        first = false;
                        result += node.data.value;
                    } else {
                        result += ',' + node.data.value;
                    }
                }
            }
        }

        return result;
    }

    updateButtonClicked(): void {
        this.okWasClicked = true;

        this.value = this.getValue();

        this.dialogRef.close();
    }

    cancelButtonClicked(): void {
        this.dialogRef.close();
    }

    onGridSizeChanged(): void {
        if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
        }
    }

    onGridReady(event: any): void {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;

        this.assignGridContents();

        setTimeout(() => {
            if (this.gridApi) {
                this.gridApi.sizeColumnsToFit();
            }
        });
    }
}