import { AfterViewInit, Component, ViewChild } from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";
import { MatDatepicker } from "@angular/material";

import {DateRenderer} from "../grid-renderers/date.renderer";
import { DateParserComponent } from "../parsers/date-parser.component";

@Component({
	template: `
			<div class="t full-width full-height" (click)="onClick()">
				<div class="tr">
					<div class="td vertical-center">
						<div class="invisible">
							<mat-form-field>
								<input matInput [matDatepicker]="picker" [(ngModel)]="date">
								<mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
							</mat-form-field>
						</div>
						<div class="full-width right-align">
							{{ display }}
						</div>
						<mat-datepicker #picker></mat-datepicker>
					</div>
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
}