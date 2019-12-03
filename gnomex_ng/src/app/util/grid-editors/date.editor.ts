import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";
import { MatDatepicker } from "@angular/material";

import {DateRenderer} from "../grid-renderers/date.renderer";
import { DateParserComponent } from "../parsers/date-parser.component";

@Component({
	template: `
        <div class="full-width full-height flex-row-container">
            <div class="full-width full-height flex-stretch">
                <div class="t full-width full-height" (click)="onClick()">
                    <div class="tr">
                        <div  class="td vertical-center">
                            <div class="invisible">
                                <mat-form-field>
                                    <input matInput [matDatepicker]="picker" (dateChange)="stopEditing()"  [(ngModel)]="date">
                                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                                </mat-form-field>
                            </div>
                            <div class="full-width right-align">
                                {{ display }}
                            </div>
                            <mat-datepicker  #picker></mat-datepicker>
                        </div>
                    </div>
                </div>
            </div>
            <div *ngIf="showFillButton" class="full-height button-container">
                <button class="full-height" (click)="onFillButtonClicked()">Fill</button>
            </div>
        </div>
	`,
	styles: [`
		.t  { display: table;      }  
		.tr { display: table-row;  }  
		.td { display: table-cell; }
			
		.full-width  { width:  100%; }  
		.full-height { height: 100%; }
			
		.vertical-center { vertical-align: middle; }
			
		.invisible { 
			visibility: hidden;
			width: 0;
			height: 0;
		}
			
		.right-align { text-align: right; }
        
        .flex-row-container { 
            display: flex;
            flex-direction: row;
        }
        .flex-stretch {
            flex: 1;
        }
	`]
})
export class DateEditor implements AfterViewInit, ICellEditorAngularComp {

	@ViewChild('picker') picker: MatDatepicker<Date>;

	params: any;
	value: string;
	_date: Date;
	display: string;
	dateParser_valueToDisplay: DateParserComponent;
	dateParser_displayToValue: DateParserComponent;

	private gridFieldName: string = '';

    showFillButton: boolean;		// This represents whether the editor should show the "Fill" button,
                                    // which is used to copy the value of this cell to other cells in this column in the grid
    fillGroupAttribute: string;		// This attribute is used to specify which "Group" a particular
                                    // row belongs to, which is used when the fill button is active.
                                    // When clicked, the fill button will copy the data in that cell
                                    // to the corresponding cells in rows of the same group.

	get date(): Date {
		return this._date;
	}

	set date(date: Date) {
		this._date = date;

		this.display = DateEditor.getDisplayStringFromDate(this._date);
		this.value = this.dateParser_displayToValue.parseDateString(this.display);
	}

	agInit(params: any): void {
		this.params = params;
		this.value = "";
		this.display = "";

		this.dateParser_valueToDisplay = new DateParserComponent('YYYY-MM-DD', 'MM/DD/YYYY');
		this.dateParser_displayToValue = new DateParserComponent('MM/DD/YYYY', 'YYYY-MM-DD');

		if (this.params && this.params.value && this.params.value != "") {
			this.value = this.params.value;
			this._date = new Date();

			this.display = this.dateParser_valueToDisplay.parseDateString(this.value);
			let tokens = this.display.split("/");
			this._date.setFullYear(+tokens[2], +tokens[0] - 1, +tokens[1]);
		}

		if (this.params && this.params.column && this.params.column.colDef) {
            this.gridFieldName = this.params.column.colDef.field;
		    this.fillGroupAttribute = this.params.column.colDef.fillGroupAttribute;

            this.showFillButton = this.params.column.colDef.showFillButton && ("" + this.params.column.colDef.showFillButton).toLowerCase() !== "false";
        }

        if (this.showFillButton && (!this.fillGroupAttribute || this.fillGroupAttribute === '')) {
            throw new Error('Invalid state, cannot use fill button without specifying the fillGroupAttribute.');
        }

	}

	ngAfterViewInit(): void {
		setTimeout(() => { this.picker.open();});
	}

	onChange(event: any): void {
		// toLocaleDateString works in this case because we used new Date before, so that it has the
		// user's timezone, and will not produce date change errors.
		// this.value = DateRenderer.parseDateString(this._date.toLocaleDateString(), 'm/d/yyyy', DateRenderer.DEFAULT_RECEIVED_DATE_FORMAT);
	}

	onClick(): void {
		this.picker.open();
	}

	stopEditing():void{
		if(this.params && this.params.column && this.params.column.gridApi){
			this.params.column.gridApi.stopEditing();
		}
	}

	private static getDisplayStringFromDate(date: Date): string {
		if (!date) {
			return "";
		}

		let months: string = (date.getMonth() + 1) > 9 ? "" + (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
		let day:    string = (date.getDate() > 9) ? "" + date.getDate() : "0" + date.getDate();
		let year:   string = "" + date.getFullYear();

		return months + "/" + day + "/" + year;
	}

	getValue(): any {
		this.display = DateEditor.getDisplayStringFromDate(this._date);
		this.value = this.dateParser_displayToValue.parseDateString(this.display);
		return this.value;
	}

	isPopup(): boolean {
		return false;
	}

    onFillButtonClicked(): void {
        if (!this.fillGroupAttribute || this.fillGroupAttribute === '') {
            throw new Error('No column attribute "fillGroupAttribute" specified. This is required to use the Fill functionality.');
        }

        if (this.params && this.params.column && this.params.column.gridApi && this.params.node && this.fillGroupAttribute && this.fillGroupAttribute !== '') {
            let thisRowNode = this.params.node;

            this.params.column.gridApi.forEachNode((rowNode, index) => {
                if (rowNode && rowNode.data && thisRowNode && thisRowNode.data
                    && rowNode.data[this.fillGroupAttribute] === thisRowNode.data[this.fillGroupAttribute]) {
                    rowNode.setDataValue(this.gridFieldName, this.value);
                }
            });

            this.params.column.gridApi.refreshCells();
        }
    }
}