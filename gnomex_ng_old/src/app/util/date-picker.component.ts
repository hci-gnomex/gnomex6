import {Component, Input, OnInit, forwardRef, Output, EventEmitter, Self, AfterViewInit, Injector} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";

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
}) export class DatePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor {

    // ngModel stuff!
    private _date: Date = null;
    private _dateString: string = '';
    private valueHasBeenSet: boolean = false;



    private _defaultToToday: boolean = false;
    @Input() set defaultToToday(value: boolean) {
        this._defaultToToday = value;
    }

    @Output("change") change: EventEmitter<string> = new EventEmitter<string>();

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
    set value(value: string) {
        this._dateString = (value === null ? "" : value);
        if(this._dateString === this.value) {
            return;
        }
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
                this.innerDateFC.setValue(new Date(+tokens[2], +tokens[0] - 1, +tokens[1]));
            } else {
                if (this._defaultToToday) {
                    this.innerDateFC.setValue(new Date());
                    this._dateString = this.value;
                }
            }

            this.onChangeCallback(this._dateString);
        });
    }
    get value(): string {
        if (!this.innerDateFC.value) {
            return "";
        }

        let months: string = (this.innerDateFC.value.getMonth() + 1) > 9 ? "" + (this.innerDateFC.value.getMonth() + 1) : "0" + (this.innerDateFC.value.getMonth() + 1);
        let day:    string = (this.innerDateFC.value.getDate() > 9) ? "" + this.innerDateFC.value.getDate() : "0" + this.innerDateFC.value.getDate();
        let year:   string = "" + this.innerDateFC.value.getFullYear();

        let formattedString: string = months + "/" + day + "/" + year;

        return this.dateParser_defaultToValue.parseDateString(formattedString);
    }

    private _formatReceived:  string = 'YYYY-MM-DD';
    private _formatDisplayed: string = 'MM/DD/YYYY';


    private dateParser_defaultToValue: DateParserComponent;
    private dateParser_valueToDefault: DateParserComponent;

    private dateParser_valueToDisplay: DateParserComponent;
    private dateParser_displayToValue: DateParserComponent;
    public innerDateFC: FormControl = new FormControl();
    public outerDateFC: AbstractControl;

    constructor(private injector: Injector){
    }

    ngOnInit(): void {

        this.dateParser_defaultToValue = new DateParserComponent('MM/DD/YYYY', this._formatReceived);
        this.dateParser_valueToDefault = new DateParserComponent(this._formatReceived, 'MM/DD/YYYY');

        this.dateParser_valueToDisplay = new DateParserComponent(this._formatReceived,  this._formatDisplayed);
        this.dateParser_displayToValue = new DateParserComponent(this._formatDisplayed, this._formatReceived);

        this.waitForInputsThenSetDateToToday();
    }

    ngAfterViewInit():void{
        setTimeout(()=>{
            let ngControl: NgControl = this.injector.get(NgControl, null);
            if(ngControl && ngControl.control){
                this.outerDateFC = ngControl.control;
                this.innerDateFC.setValidators(this.outerDateFC.validator);
                this.innerDateFC.updateValueAndValidity();
            }
        });


    }



    private onTouchedCallback: () => void = () => {};
    private onChangeCallback: (_: any) => void = () => {};

    writeValue(value: string) {
        if(!value) {
            this.innerDateFC.setValue(null);
        }
        this.value = value;
    }

    public registerOnChange(fn: any)  { this.onChangeCallback = fn; }
    public registerOnTouched(fn: any) { this.onTouchedCallback = fn; }

    // end ngModel stuff!


    waitForInputsThenSetDateToToday(): void {
        setTimeout(() => {
            if (this._defaultToToday && !this.valueHasBeenSet) {
                this.innerDateFC.setValue(new Date());
                this._dateString = this.value;
                this.onChangeCallback(this._dateString);
            }
        });
    }

    onChange() {
        if(this._dateString !== this.value) {
            this._dateString = this.value;
            this.onChangeCallback(this._dateString);
            this.change.emit(this._dateString);
        }
    }

}
