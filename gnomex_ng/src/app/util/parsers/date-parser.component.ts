import { Component } from "@angular/core";

@Component({
	template: `<div></div>`,
	styles: [``]
})
export class DateParserComponent {
	public static readonly DEFAULT_RECEIVED_DATE_FORMAT: string = "YYYY-MM-DD";
	public static readonly DEFAULT_DISPLAY_DATE_FORMAT: string = "MM/DD/YYYY";

	private _receivedDateFormat: string;
	private _displayDateFormat: string;

	isFromFormatValid: boolean;
	isToFormatValid: boolean;

	dOrder_from: number;
	mOrder_from: number;
	yOrder_from: number;

	numberOfDs_from: number;
	numberOfMs_from: number;
	numberOfYs_from: number;

	// My interpretation of the dates is that they are numbers broken apart with some character(s),
	// possibly with leading or tailing characters.
	// Ex. (mm-dd-/-yyyy) could be valid.
	// If these characters are included in the format, then I treat them as required.
	exactCopy_from: string[];

	dOrder_to: number;
	mOrder_to: number;
	yOrder_to: number;

	numberOfDs_to: number;
	numberOfMs_to: number;
	numberOfYs_to: number;

	exactCopy_to: string[];

	constructor(formatFrom: string, formatTo: string) {
		this._receivedDateFormat = formatFrom;
		this._displayDateFormat  = formatTo;

		this.isFromFormatValid = this.parseReceivedDateFormat();
		this.isToFormatValid   = this.parseDisplayDateFormat();
	}


	parseDateString(input: string): string {
		if (!input || input === "") {
			return "";
		}
		if (!this.isFromFormatValid || !this.isToFormatValid) {
			return input;
		}

		// Start extracting the data!

		let dayString: string = "";
		let monthString: string = "";
		let yearString: string = "";

		let temp: string = input;

		for (let i: number = 0; i < 4; i++) {
			if (this.dOrder_from === i) {
				if(this.exactCopy_from[i].length > 0) {
					dayString = temp.slice(0, temp.indexOf(this.exactCopy_from[i]));
				} else {
					dayString = temp;
				}

				if (this.numberOfDs_from == 1 && dayString[0] === "0") {
					dayString = dayString.slice(1, 2);
				}

				temp = temp.slice(dayString.length, temp.length);
			} else if (this.mOrder_from === i) {
				if(this.exactCopy_from[i].length > 0) {
					monthString = temp.slice(0, temp.indexOf(this.exactCopy_from[i]));
				} else {
					monthString = temp;
				}

				if (this.numberOfMs_from == 1 && monthString[0] === "0") {
					monthString = monthString.slice(1, 2);
				}

				temp = temp.slice(monthString.length, temp.length);
			} else if (this.yOrder_from === i) {
				if(this.exactCopy_from[i].length > 0) {
					yearString = temp.slice(0, temp.indexOf(this.exactCopy_from[i]));
				} else {
					yearString = temp;
				}
				temp = temp.slice(yearString.length, temp.length);
			}

			if ((temp.indexOf(this.exactCopy_from[i]) < 0)
					|| (temp.slice(0, this.exactCopy_from[i].length) !== this.exactCopy_from[i])) {
				return input;
			}
			temp = temp.slice(this.exactCopy_from[i].length, temp.length);
		}

		if (!dayString.match(/\d{1,2}/) || !monthString.match(/\d{1,2}/) || !yearString.match(/\d{4}/)) {
			return input;
		}

		// Now, build the parsed string!
		let resultString: string = "";

		for (let i: number = 0; i < 4; i++) {
			if (this.dOrder_to === i) {
				if (dayString.length < this.numberOfDs_to) {
					dayString = "0" + dayString;
				}
				resultString = resultString + dayString;
			} else if (this.mOrder_to === i) {
				if (monthString.length < this.numberOfMs_to) {
					monthString = "0" + monthString;
				}
				resultString = resultString + monthString;
			} else if (this.yOrder_to === i) {
				resultString = resultString + yearString;
			}

			resultString = resultString + this.exactCopy_to[i];
		}

		return resultString;
	}

	private parseReceivedDateFormat(): boolean {
		let previousCharacter: string = "";
		let orderCount: number = 0;

		this.dOrder_from = -1;
		this.mOrder_from = -1;
		this.yOrder_from = -1;

		this.numberOfDs_from = 0;
		this.numberOfMs_from = 0;
		this.numberOfYs_from = 0;

		this.exactCopy_from = ["", "", "", ""];

		for (let i of this._receivedDateFormat) {
			// first, we're checking for incorrect formats with repeated blocks, mm-dd-mm
			if ((i !== previousCharacter)
					&& ((i === 'D' && this.numberOfDs_from > 0)
							|| (i === 'M' && this.numberOfMs_from > 0)
							|| (i === 'Y' && this.numberOfYs_from > 0))) {
				return false;
			}

			if (i === 'D') {
				if (this.numberOfDs_from === 0) {
					orderCount++;
					this.dOrder_from = orderCount;
				}
				this.numberOfDs_from++;
			} else if (i === 'M') {
				if (this.numberOfMs_from === 0) {
					orderCount++;
					this.mOrder_from = orderCount;
				}
				this.numberOfMs_from++;
			} else if (i === 'Y') {
				if (this.numberOfYs_from === 0) {
					orderCount++;
					this.yOrder_from = orderCount;
				}
				this.numberOfYs_from++;
			} else {
				if (i.match(/\d/)) {
					return false;
				}
				this.exactCopy_from[orderCount] = this.exactCopy_from[orderCount] + i;
			}

			previousCharacter = i;
		}

		// We need separators in between the date numbers, at least.
		if (this.exactCopy_from[1].length == 0 || this.exactCopy_from[2].length == 0) {
			return false;
		}
		// We also support only a limited number of formats.
		if ((this.numberOfDs_from > 2 || this.numberOfDs_from < 1 )
				|| (this.numberOfMs_from > 2 || this.numberOfMs_from < 1 )
				|| (this.numberOfYs_from !== 4 )) {
			return false;
		}

		return true;
	}

	private parseDisplayDateFormat(): boolean {
		this.dOrder_to = -1;
		this.mOrder_to = -1;
		this.yOrder_to = -1;

		this.numberOfDs_to = 0;
		this.numberOfMs_to = 0;
		this.numberOfYs_to = 0;

		this.exactCopy_to = ["", "", "", ""];

		let previousCharacter: string = "";
		let orderCount: number = 0;

		for (let i of this._displayDateFormat) {
			// first, we're checking for incorrect formats with repeated blocks, mm-dd-mm
			if ((i !== previousCharacter)
					&& ((i === 'D' && this.numberOfDs_to > 0)
							|| (i === 'M' && this.numberOfMs_to > 0)
							|| (i === 'Y' && this.numberOfYs_to > 0))) {
				return false;
			}

			if (i === 'D') {
				if (this.numberOfDs_to === 0) {
					orderCount++;
					this.dOrder_to = orderCount;
				}
				this.numberOfDs_to++;
			} else if (i === 'M') {
				if (this.numberOfMs_to === 0) {
					orderCount++;
					this.mOrder_to = orderCount;
				}
				this.numberOfMs_to++;
			} else if (i === 'Y') {
				if (this.numberOfYs_to === 0) {
					orderCount++;
					this.yOrder_to = orderCount;
				}
				this.numberOfYs_to++;
			} else {
				if (this._displayDateFormat.match(/\d/)) {
					return false;
				}
				this.exactCopy_to[orderCount] = this.exactCopy_to[orderCount] + i;
			}

			previousCharacter = i;
		}

		// We need separators in between the date numbers, at least.
		if (this.exactCopy_to[1].length == 0 || this.exactCopy_to[2].length == 0) {
			return false;
		}
		// We also support only a limited number of formats.
		if ((this.numberOfDs_to > 2 || this.numberOfDs_to < 1 )
				|| (this.numberOfMs_to > 2 || this.numberOfMs_to < 1 )
				|| (this.numberOfYs_to !== 4 )) {
			return false;
		}

		return true;
	}
}