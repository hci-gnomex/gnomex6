import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {jqxInputComponent} from "../../../../assets/jqwidgets-ts/angular_jqxinput";


@Component({
	selector: 'number-jqxinput',
	templateUrl: './number-jqxinput.component.html',
	styles: [`
			.warning {
					background-color: #ffff3f;
			}
	`]
})
export class NumberJqxInputComponent {

	@ViewChild('numberInput') numberInput: jqxInputComponent;

	@Input('minimumDigits') minimumDigits: number = 0;
	@Input('maximumDigits') maximumDigits: number = 0;

	@Input('width') width: any;
	@Input('height') height: any;

	@Input('value') value: string;

	@Input('warningColor') warningColor: string = 'ffff3f';

	@Output('(input)') input: EventEmitter<string> = new EventEmitter<string>();

	private divClasses: string = ' warning '; //'';

	private previouslyAcceptedValue: string = '';

	private warning: boolean = false;

	warningActive(warningOn?: boolean): boolean {
		if (warningOn == undefined || warningOn == null) {
			return this.warning;
		}

		this.warning = warningOn;
		this.processWarning();
	}

	clearData(): void {
		this.previouslyAcceptedValue = '';
		this.numberInput.value('');
		this.divClasses = ' ';
	}

	private onInputAccountNumberInput() {
		let newInputContents: string = '' + this.numberInput.val();
		let regex: RegExp = new RegExp('^\\d{0,' + this.maximumDigits + '}$');

		if(newInputContents.match(regex)) {
			this.previouslyAcceptedValue = newInputContents;
			this.input.emit('newInputContents');
		} else {
			this.numberInput.val(this.previouslyAcceptedValue);
		}
	}

	private processWarning(): void {
		if (this.warning) {
			this.divClasses = ' warning ';
		} else {
			this.divClasses = ' ';
		}
	}
}