import {Component, ElementRef, ViewChild} from "@angular/core";
import {ICellEditorAngularComp} from "ag-grid-angular";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {SpinnerDialogComponent} from "../popup/spinner-dialog.component";

@Component({
    template: `
		<div class="full-width full-height flex-row-container">
			<div class="t flex-stretch full-height">
				<div class="tr">
					<div class="td vertical-center right-align">
						<input #theInput [(ngModel)]="value" type="text" class="full-width full-height right-align padded"/>
					</div>
				</div>
			</div>
            <div *ngIf="showFillButton" class="full-height button-container">
                <button class="full-height" (click)="onFillButtonClicked()">Fill</button>
            </div>
		</div>
	`,
    styles: [`
			
		.full-width  { width:  100% }
		.full-height { height: 100% }
		
		.t  { display: table; }
		.tr { display: table-row; }
		.td { display: table-cell; }
		
		.vertical-center { vertical-align: middle;   }
		.right-align     { text-align:     right;    }
		.padded          { padding:        0 0.3rem; }
        
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .flex-stretch {
            flex: 1;
        }
	`]
})
export class TextAlignRightMiddleEditor implements ICellEditorAngularComp {

    @ViewChild('theInput') theInput: ElementRef;

    params: any;
    value: string;

    private gridFieldName: string = '';

    showFillButton: boolean;		// This represents whether the editor should show the "Fill" button,
    // which is used to copy the value of this cell to other cells in this column in the grid
    fillGroupAttribute: string;		// This attribute is used to specify which "Group" a particular
    // row belongs to, which is used when the fill button is active.
    // When clicked, the fill button will copy the data in that cell
    // to the corresponding cells in rows of the same group.

    private _spinnerDialogIsOpen: boolean = false;
    private spinnerDialogRefs: MatDialogRef<SpinnerDialogComponent>[] = [];
    constructor(private dialog: MatDialog) { }

    agInit(params: any): void {
        this.params = params;

        this.value = (this.params && this.params.value) ? this.params.value : "";

        if (this.params && this.params.column && this.params.column.colDef) {
            this.gridFieldName = this.params.column.colDef.field;
            this.fillGroupAttribute = this.params.column.colDef.fillGroupAttribute;

            this.showFillButton = this.params.column.colDef.showFillButton && ("" + this.params.column.colDef.showFillButton).toLowerCase() !== "false";
        }

        if (this.showFillButton && (!this.fillGroupAttribute || this.fillGroupAttribute === '')) {
            throw new Error('Invalid state, cannot use fill button without specifying the fillGroupAttribute.');
        }

        setTimeout(() => {
            if (this.theInput && this.theInput.nativeElement) {
                this.theInput.nativeElement.focus();
            }
        });
    }

    getValue(): string {
        return '' + this.value;
    }

    onFillButtonClicked(): void {
        if (!this.fillGroupAttribute || this.fillGroupAttribute === '') {
            throw new Error('No column attribute "fillGroupAttribute" specified. This is required to use the Fill functionality.');
        }

        if (this.params && this.params.column && this.params.column.gridApi && this.params.node && this.fillGroupAttribute && this.fillGroupAttribute !== '') {
            let thisRowNode = this.params.node;
            this.startSpinnerDialog();

            this.params.column.gridApi.forEachNode((rowNode, index) => {
                if (rowNode && rowNode.data && thisRowNode && thisRowNode.data
                    && rowNode.data[this.fillGroupAttribute] === thisRowNode.data[this.fillGroupAttribute]) {
                    rowNode.setDataValue(this.gridFieldName, this.value);
                    rowNode.setDataValue(this.gridFieldName + "_1", this.value);
                }
            });

            this.params.column.gridApi.refreshCells();
            setTimeout(() => {
                this.stopSpinnerDialogs();
            });
        }
    }

    startSpinnerDialog(): MatDialogRef<SpinnerDialogComponent> {
        if (this._spinnerDialogIsOpen) {
            return null;
        }

        this._spinnerDialogIsOpen = true;

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = {
            message: "Please wait...",
            strokeWidth: 3,
            diameter: 30
        };
        configuration.width = "13em";
        configuration.disableClose = true;

        let dialogRef: MatDialogRef<SpinnerDialogComponent> = this.dialog.open(SpinnerDialogComponent, configuration);
        dialogRef.afterClosed().subscribe(() => { this._spinnerDialogIsOpen = false; });
        this.spinnerDialogRefs.push(dialogRef);

        return dialogRef;
    }

    stopSpinnerDialogs(): void {
        for (let dialogRef of this.spinnerDialogRefs) {
            setTimeout(() => {
                dialogRef.close();
            });
        }
        this.spinnerDialogRefs = [];
    }
}
