import { AfterViewInit, Component, ViewChild } from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";
import { MatDatepicker } from "@angular/material";

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
							{{date.toLocaleDateString()}}
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
	date: Date;

	agInit(params: any): void {
		this.params = params;
		this.value = "";

		if (this.params && this.params.value) {
			this.value = this.params.value;
			this.date = new Date(Date.parse(this.value));
			// this.value = this.initialDate.toLocaleDateString();
		}
	}

	ngAfterViewInit(): void {
		setTimeout(() => { this.picker.open();});
	}

	onChange(event: any): void {

	}

	onClick(): void {
		console.log("value is : " + this.value);
		this.picker.open();
	}

	getValue(): any {
		return this.date.toLocaleDateString();
	}

	isPopup(): boolean {
		return false;
	}
}