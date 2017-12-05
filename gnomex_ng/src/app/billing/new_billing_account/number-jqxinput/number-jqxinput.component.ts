import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {jqxInputComponent} from "../../../../assets/jqwidgets-ts/angular_jqxinput";


@Component({
	selector: 'number-jqxinput',
	templateUrl: './number-jqxinput.component.html'
})
export class NumberJqxInputComponent {

	@ViewChild('numberInput') numberInput: jqxInputComponent;

	@Input('minimumDigits') minimumDigits: number = 0;
	@Input('maximumDigits') maximumDigits: number = 0;

	@Input('width') width: any;
	@Input('height') height: any;

	@Input('value') value: string;

	@Output('(input)') input: EventEmitter<string> = new EventEmitter<string>();

	private previouslyAcceptedValue: string = '';

	clearData(): void {
		this.previouslyAcceptedValue = '';
		this.numberInput.value('');
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
}