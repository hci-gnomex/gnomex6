import {Component, ElementRef, OnDestroy, OnInit, ViewChild, Input} from "@angular/core";

import { jqxCalendarComponent } 	from "../../../assets/jqwidgets-ts/angular_jqxcalendar";
import { jqxInputComponent } 	from "../../../assets/jqwidgets-ts/angular_jqxinput";

// This component has an text input containing the date which the user shouldn't interact with.
// Instead, when the input box is opened, a window should open with a calendar element inside it.
// Then, when a date is clicked on the calendar, the date is filled in into the textbox.

@Component({
	selector: "GnomexStyledDatePicker",
	templateUrl: "./gnomex-styled-date-picker.component.html",
	styles: [`
      .inline-block {
					display: inline-block;
			}
			
			.hiding {
					display: none;
			}
	`]
})
export class GnomexStyledDatePickerComponent implements OnInit, OnDestroy {

	@ViewChild("inputReference") inputReference:jqxInputComponent;
	@ViewChild("calendarReference") calendarReference:jqxCalendarComponent;

	private date: Date = null;
	private displayDate: string = "";

	@Input('defaultToToday') defaultToToday: boolean = false;

	//private
	open:boolean = false;

	private setDateToTodayOnOpen:boolean = false;

	ngOnInit(): void {
		if(this.defaultToToday) {
			this.setSelectedDateToToday();
		}
	}

	ngOnDestroy(): void {	}

	constructor() {	}

	openCalendar(): void {
		this.open = true;

		if(this.setDateToTodayOnOpen) {
			this.setDateToTodayOnOpen = false;
			this.calendarReference.setDate(new Date);
		}
	}

	closeCalendar(): void {
		this.open = false;
	}

	private toggleCalendarOpen(): void {
		this.open = !this.open;
	}

	private onImageClicked(): void {
		this.inputReference.focus();
		this.openCalendar();
	}

	private updateDate(): void {
		this.date = this.calendarReference.val();
		// this.displayDate =  ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1) + '/';
		// this.displayDate += (this.date.getDate() < 10 ? '0' : '') + this.date.getDate() + '/' + this.date.getFullYear();

		this.displayDate =  ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1) + '/';
		this.displayDate += (this.date.getDate() < 10 ? '0' : '') + this.date.getDate() + '/' + this.date.getFullYear();
	}

	setSelectedDateToToday(): void {
		this.date = new Date();

		this.displayDate =  ((this.date.getMonth() + 1) < 10 ? '0' : '') + (this.date.getMonth() + 1) + '/';
		this.displayDate += (this.date.getDate() < 10 ? '0' : '') + this.date.getDate() + '/' + this.date.getFullYear();

		try {
			this.calendarReference.val(this.date);
		} catch (e) {
			this.setDateToTodayOnOpen = true;
		}
	}
}