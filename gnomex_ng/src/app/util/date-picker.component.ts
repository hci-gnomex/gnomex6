import {Component, Input, OnInit, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import {DateParserComponent} from "./parsers/date-parser.component";

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true
};

@Component ({
    selector: 'date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [``],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
}) export class DatePickerComponent implements OnInit, ControlValueAccessor {

    // ngModel stuff!
    private _date: Date;
    private _dateString: string = '';
    private valueHasBeenSet: boolean = false;

    set value(value: string) {
        this._dateString = value;
        this.valueHasBeenSet = true;

        // This setTimeout is needed because on initialization, inputs are run before ngOnInit, and
        // we need information from both it and the other inputs before processing this one.
        setTimeout(() => {
            if (!this.dateParser_valueToDisplay || !this.dateParser_displayToValue) {
                console.error("dateParsers not initialized");
                return;
            }

            let tokens = this.dateParser_valueToDefault.parseDateString(this._dateString).split("/");

            if (tokens.length === 3) {
                this._date = new Date();
                this._date.setFullYear(+tokens[2], +tokens[0] - 1, +tokens[1]);
            } else {
                if (this._defaultToToday) {
                    this._date = new Date();
                    this._dateString = this.value;
                }
            }

            this.onChangeCallback(this._dateString);
        });
    }
    get value(): string {
        if (!this._date) {
            return "";
        }

        let months: string = (this._date.getMonth() + 1) > 9 ? "" + (this._date.getMonth() + 1) : "0" + (this._date.getMonth() + 1);
        let day:    string = (this._date.getDate() > 9) ? "" + this._date.getDate() : "0" + this._date.getDate();
        let year:   string = "" + this._date.getFullYear();

        let formattedString: string = months + "/" + day + "/" + year;

        return this.dateParser_defaultToValue.parseDateString(formattedString);
    }

    private onTouchedCallback: () => void = () => {};
    private onChangeCallback: (_: any) => void = () => {};

    writeValue(value: string) { this.value = value; }

    registerOnChange(fn: any)  { this.onChangeCallback = fn; }
    registerOnTouched(fn: any) { this.onTouchedCallback = fn; }

    // end ngModel stuff!

    private _defaultToToday: boolean = false;
    @Input() set defaultToToday(value: boolean) {
        this._defaultToToday = value;
    }

    @Input('placeholder') placeholder: string = 'Choose a Date';
    @Input('required') required: boolean = false;

    @Input('textInputDisabled') textInputDisabled: boolean = true;
    @Input('datePickerDisabled') datePickerDisabled: boolean = false;

    @Input() set formatReceived(receivedFormat: string) {
        this._formatReceived = receivedFormat;

        this.dateParser_valueToDefault = new DateParserComponent(this._formatReceived, 'MM/DD/YYYY');
        this.dateParser_valueToDisplay = new DateParserComponent(this._formatReceived,  this._formatDisplayed);
        this.dateParser_displayToValue = new DateParserComponent(this._formatDisplayed, this._formatReceived);
    }
    @Input() set formatDisplayed(displayFormat: string) {
        this._formatDisplayed = displayFormat;

        this.dateParser_valueToDisplay = new DateParserComponent(this._formatReceived,  this._formatDisplayed);
        this.dateParser_displayToValue = new DateParserComponent(this._formatDisplayed, this._formatReceived);
    }

    private _formatReceived:  string = 'YYYY-MM-DD';
    private _formatDisplayed: string = 'MM/DD/YYYY';


    private dateParser_defaultToValue: DateParserComponent;
    private dateParser_valueToDefault: DateParserComponent;

    private dateParser_valueToDisplay: DateParserComponent;
    private dateParser_displayToValue: DateParserComponent;

    ngOnInit(): void {
        this.dateParser_defaultToValue = new DateParserComponent('MM/DD/YYYY', this._formatReceived);
        this.dateParser_valueToDefault = new DateParserComponent(this._formatReceived, 'MM/DD/YYYY');

        this.dateParser_valueToDisplay = new DateParserComponent(this._formatReceived,  this._formatDisplayed);
        this.dateParser_displayToValue = new DateParserComponent(this._formatDisplayed, this._formatReceived);

        this.waitForInputsThenSetDateToToday();
    }

    waitForInputsThenSetDateToToday(): void {
        setTimeout(() => {
            if (this._defaultToToday && !this.valueHasBeenSet) {
                this._date = new Date();
                this._dateString = this.value;
                this.onChangeCallback(this._dateString);
            }
        });
    }

    onDatePickerChange(){
        this._dateString = this.value;
        this.onChangeCallback(this._dateString);
    }

}