import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import {PropertyService} from "../../services/property.service";

import { DateParserComponent } from "../parsers/date-parser.component";
import {CellRendererValidation} from "./cell-renderer-validation";

@Component({
	template: `
		<div [matTooltip]="this.errorMessage"
             [matTooltipShowDelay]="300"
             [matTooltipHideDelay]="300"
			 class="full-width full-height  {{this.errorMessage && this.errorMessage !== '' ? 'error' : ''}}">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center right-align padded cursor">
						{{ displayString }}
					</div>
					<!--<div class="td vertical-center">-->
						<!--<button class="full-height"><img src="../../../assets/calendar_date.png" alt=""/></button>-->
					<!--</div>-->
				</div>
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
			
		.cursor { cursor: pointer; }

		.error {
			background: linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25), rgba(255,0,0,0.25));
			border: solid red 2px;
		}
	`]
})
export class DateRenderer extends CellRendererValidation{

	public static readonly DEFAULT_RECEIVED_DATE_FORMAT: string = "yyyy-mm-dd";
	public static readonly DEFAULT_DISPLAY_DATE_FORMAT: string = "mm/dd/yyyy";

	value: any;
    displayString: string;

	// constructor(private propertyService: PropertyService) { }
	// this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;

	agInit2(params: any): void {
		this.value = this.params.value;
		this.displayString = "";

		if (this.value && this.value !== '') {
			if (this.params && this.params.colDef && this.params.colDef.dateParser) {
				this.displayString = this.params.colDef.dateParser.parseDateString(this.value);
			} else {
				this.displayString = this.value;
			}
		}
	}

	static parseDateString(input: string, fromFormat: string, toFormat: string): string {

		if (!input || input === "") {
			return "";
		}

		let isFromFormatValid: boolean = true;
		let isToFormatValid: boolean = true;

		let dOrder_from: number = -1;
		let mOrder_from: number = -1;
		let yOrder_from: number = -1;

		let numberOfDs_from: number = 0;
		let numberOfMs_from: number = 0;
		let numberOfYs_from: number = 0;

		// My interpretation of the dates is that they are numbers broken apart with some character(s),
		// possibly with leading or tailing characters.
		// Ex. (mm-dd-/-yyyy) could be valid.
		// If these characters are included in the format, then I treat them as required.
		let exactCopy_from: string[] = ["", "", "", ""];

		let dOrder_to: number = -1;
		let mOrder_to: number = -1;
		let yOrder_to: number = -1;

		let numberOfDs_to: number = 0;
		let numberOfMs_to: number = 0;
		let numberOfYs_to: number = 0;

		let exactCopy_to: string[] = ["", "", "", ""];

		fromFormat = fromFormat.toLowerCase();
		toFormat = toFormat.toLowerCase();

		let previousCharacter: string = "";
		let orderCount: number = 0;

		for (let i of fromFormat) {
			// first, we're checking for incorrect formats with repeated blocks, mm-dd-mm
			if (i !== previousCharacter) {
				if ((i === 'd' && numberOfDs_from > 0)
						|| (i === 'm' && numberOfMs_from > 0)
						|| (i === 'y' && numberOfYs_from > 0)) {
					isFromFormatValid = false;
					return input;
				} else {
					// Do nothing.
				}
			}

			if (i === 'd') {
				if (numberOfDs_from === 0) {
					orderCount++;
					dOrder_from = orderCount;
				}
				numberOfDs_from++;
			} else if (i === 'm') {
				if (numberOfMs_from === 0) {
					orderCount++;
					mOrder_from = orderCount;
				}
				numberOfMs_from++;
			} else if (i === 'y') {
				if (numberOfYs_from === 0) {
					orderCount++;
					yOrder_from = orderCount;
				}
				numberOfYs_from++;
			} else {
				if (i.match(/\d/)) {
					isFromFormatValid = false;
					return input;
				}
				exactCopy_from[orderCount] = exactCopy_from[orderCount] + i;
			}

			previousCharacter = i;
		}

		// We need separators in between the date numbers, at least.
		if (exactCopy_from[1].length == 0 || exactCopy_from[2].length == 0) {
			isFromFormatValid = false;
			return input;
		}
		// We also support only a limited number of formats.
		if ((numberOfDs_from > 2 || numberOfDs_from < 1 )
				|| (numberOfMs_from > 2 || numberOfMs_from < 1 )
				|| (numberOfYs_from !== 4 )) {
			isFromFormatValid = false;
			return input;
		}

		previousCharacter = "";
		orderCount = 0;

		for (let i of toFormat) {
			// first, we're checking for incorrect formats with repeated blocks, mm-dd-mm
			if (i !== previousCharacter) {
				if ((i === 'd' && numberOfDs_to > 0)
						|| (i === 'm' && numberOfMs_to > 0)
						|| (i === 'y' && numberOfYs_to > 0)) {
					isToFormatValid = false;
					return input;
				} else {
					// Do nothing.
				}
			}

			if (i === 'd') {
				if (numberOfDs_to === 0) {
					orderCount++;
					dOrder_to = orderCount;
				}
				numberOfDs_to++;
			} else if (i === 'm') {
				if (numberOfMs_to === 0) {
					orderCount++;
					mOrder_to = orderCount;
				}
				numberOfMs_to++;
			} else if (i === 'y') {
				if (numberOfYs_to === 0) {
					orderCount++;
					yOrder_to = orderCount;
				}
				numberOfYs_to++;
			} else {
				if (toFormat.match(/\d/)) {
					isToFormatValid = false;
					return input;
				}
				exactCopy_to[orderCount] = exactCopy_to[orderCount] + i;
			}

			previousCharacter = i;
		}

		// We need separators in between the date numbers, at least.
		if (exactCopy_to[1].length == 0 || exactCopy_to[2].length == 0) {
			isToFormatValid = false;
			return input;
		}
		// We also support only a limited number of formats.
		if ((numberOfDs_to > 2 || numberOfDs_to < 1 )
				|| (numberOfMs_to > 2 || numberOfMs_to < 1 )
				|| (numberOfYs_to !== 4 )) {
			isToFormatValid = false;
			return input;
		}

		if (!isFromFormatValid || !isToFormatValid) {
			return input;
		}

		// Start extracting the data!

		let dayString: string = "";
		let monthString: string = "";
		let yearString: string = "";

		let temp: string = input;

		for (let i: number = 0; i < 4; i++) {
			if (dOrder_from === i) {
				if(exactCopy_from[i].length > 0) {
					dayString = temp.slice(0, temp.indexOf(exactCopy_from[i]));
				} else {
					dayString = temp;
				}

				if (numberOfDs_from == 1 && dayString[0] === "0") {
					dayString = dayString.slice(1, 2);
				}

				temp = temp.slice(dayString.length, temp.length);
			} else if (mOrder_from === i) {
				if(exactCopy_from[i].length > 0) {
					monthString = temp.slice(0, temp.indexOf(exactCopy_from[i]));
				} else {
					monthString = temp;
				}

				if (numberOfMs_from == 1 && monthString[0] === "0") {
					monthString = monthString.slice(1, 2);
				}

				temp = temp.slice(monthString.length, temp.length);
			} else if (yOrder_from === i) {
				if(exactCopy_from[i].length > 0) {
					yearString = temp.slice(0, temp.indexOf(exactCopy_from[i]));
				} else {
					yearString = temp;
				}
				temp = temp.slice(yearString.length, temp.length);
			}

			if ((temp.indexOf(exactCopy_from[i]) < 0)
					|| (temp.slice(0, exactCopy_from[i].length) !== exactCopy_from[i])) {
				return input;
			}
			temp = temp.slice(exactCopy_from[i].length, temp.length);
		}

		if (!dayString.match(/\d{1,2}/) || !monthString.match(/\d{1,2}/) || !yearString.match(/\d{4}/)) {
			return input;
		}

		// Now, build the parsed string!
		let resultString: string = "";

		for (let i: number = 0; i < 4; i++) {
			if (dOrder_to === i) {
				if (dayString.length < numberOfDs_to) {
					dayString = "0" + dayString;
				}
				resultString = resultString + dayString;
			} else if (mOrder_to === i) {
				if (monthString.length < numberOfMs_to) {
					monthString = "0" + monthString;
				}
				resultString = resultString + monthString;
			} else if (yOrder_to === i) {
				resultString = resultString + yearString;
			}

			resultString = resultString + exactCopy_to[i];
		}

		return resultString;
	}

	refresh(params: any): boolean {
		return false;
	}
}