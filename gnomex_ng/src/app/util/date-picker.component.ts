import {Component, Input, OnInit} from "@angular/core";
import {DateParserComponent} from "./parsers/date-parser.component";

@Component ({
    selector: 'date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [``]
}) export class DatePickerComponent implements OnInit {

    private _date: Date;
    private _dateString: string = '';

    @Input() set value(value: string) {
        this._dateString = value;
        // This setTimeout is needed because on initialization, inputs are run before ngOnInit, and
        // we need information from both it and the other inputs before processing this one.
        setTimeout(() => {
            if (!this.dateParser_valueToDisplay || !this.dateParser_displayToValue) {
                console.error("dateParsers not initialized");
                return;
            }

            this._date = new Date();
            let tokens = this.dateParser_valueToDefault.parseDateString(this._dateString).split("/");
            this._date.setFullYear(+tokens[2], +tokens[0] - 1, +tokens[1]);
        });
    }


    @Input('defaultToToday') defaultToToday: boolean = false;
    @Input('placeholder') placeholder: string = 'Choose a Date';
    @Input('textInputDisabled') textInputDisabled: boolean = true;
    @Input('datePickerDisabled') datePickerDisabled: boolean = false;

    private _formatReceived:  string = 'YYYY-MM-DD';
    private _formatDisplayed: string = 'MM/DD/YYYY';

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

    @Input('required') required: boolean = false;

    private dateParser_valueToDefault: DateParserComponent;
    private dateParser_valueToDisplay: DateParserComponent;
    private dateParser_displayToValue: DateParserComponent;

    ngOnInit(): void {
        this.dateParser_valueToDefault = new DateParserComponent(this._formatReceived, 'MM/DD/YYYY');

        this.dateParser_valueToDisplay = new DateParserComponent(this._formatReceived,  this._formatDisplayed);
        this.dateParser_displayToValue = new DateParserComponent(this._formatDisplayed, this._formatReceived);


    }
}