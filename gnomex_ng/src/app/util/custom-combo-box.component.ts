import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    Output, SimpleChange,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import {Subscription} from "rxjs";
import {UtilService} from "../services/util.service";
import {debounceTime} from "rxjs/operators";

@Component({
    selector: "custom-combo-box",
    template: `
        <mat-form-field [classList]="'full-width full-height ' + customFieldClasses" [matTooltip]="this.tooltip">
            <input #input matInput class="full-width full-height"
                   name="customComboBoxFilter"
                   autocomplete="off"
                   [placeholder]="this.temporaryPlaceholder ? (this.innerControl.value ? '' : this.placeholder) : this.placeholder"
                   [matAutocomplete]="auto" [formControl]="this.innerControl">
            <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete"
                              (optionSelected)="this.selectOption($event.option.value)"
                              (opened)="this.onOpened()" (closed)="this.onClosed()" [displayWith]="this.displayFn">
                <mat-option [classList]="customOptionClasses" *ngIf="this.allowNone && (this.forceShowNone || !this.innerControl.value)">None</mat-option>
                <mat-option [classList]="customOptionClasses" *ngFor="let opt of this.loadedOptions" [value]="opt">
                    {{ displayField ? opt[displayField] : opt}}
                </mat-option>
                <mat-option [classList]="customOptionClasses" *ngIf="this.includeLoadingOption">Loading...</mat-option>
            </mat-autocomplete>
            <mat-error *ngIf="this.innerControl.hasError('required')">{{ placeholder }} is required</mat-error>
        </mat-form-field>
    `,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomComboBoxComponent,
        multi: true,
    }],
})

export class CustomComboBoxComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
    @ViewChild("input") inputElement: ElementRef;

    @Input() public placeholder: string = "";
    @Input() public temporaryPlaceholder: boolean = false;
    @Input() public tooltip: string = "";
    @Input() public allowNone: boolean = true;
    public forceShowNone: boolean = false;

    @Input() private options: any[] = [];
    public isOpen: boolean = false;
    public includeLoadingOption: boolean = true;
    public loadedOptions: any[] = [];

    @Input() private valueField: string;
    @Input() private forceEmitObject: boolean = false;
    @Input() public displayField: string;

    @Input() public set customFieldClasses(value: string) {
        this._customFieldClasses = value ? value : "";
    }
    public get customFieldClasses(): string {
        return !!this._customFieldClasses ? this._customFieldClasses : 'mat-form-field-should-float';
    }

    private _customFieldClasses: string = "";

    @Input() public set customOptionClasses(value: string) {
        this._customOptionClasses = value ? value : "";
    }
    public get customOptionClasses(): string {
        return !!this._customOptionClasses ? this._customOptionClasses : 'mat-option';
    }

    private _customOptionClasses: string = "";

    private outerControl: AbstractControl = new FormControl();
    public innerControl: FormControl = new FormControl(null);
    private ignoreInnerControlChanges: boolean = false;
    private innerControlSubscription: Subscription;
    private noNgControl: boolean = false;

    private onChangeFn: (val: any) => void = () => {};
    private onTouchedFn: () => void = () => {};

    @Output() optionSelected: EventEmitter<any> = new EventEmitter<any>();

    public displayFn: (opt?: any) => string | undefined = (opt?: any) => {
        return opt ? (this.displayField ? opt[this.displayField] : opt) : undefined;
    };

    constructor(private injector: Injector) {
    }

    ngAfterViewInit(): void {
        let ngControl: NgControl = this.injector.get(NgControl, null);
        if (ngControl && ngControl.control) {
            this.outerControl = ngControl.control;
            this.innerControl.setValidators(this.outerControl.validator);
            setTimeout(() => {
                this.loadOnlyCurrentValue();
            });
        } else {
            this.noNgControl = true;
        }

        this.innerControlSubscription = this.innerControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
            if (!this.ignoreInnerControlChanges) {
                this.filterOptions();
            } else {
                this.ignoreInnerControlChanges = false;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.options) {
            let optionsChange: SimpleChange = changes.options;
            if (!optionsChange.currentValue) {
                this.options = [];
            }
            this.includeLoadingOption = true;
        }

        setTimeout(() => {
            if (this.isOpen) {
                this.filterOptions();
                this.includeLoadingOption = false;
            } else {
                this.loadOnlyCurrentValue();
            }
        });
    }

    writeValue(obj: any): void {
        this.loadOnlyCurrentValue();
    }

    registerOnChange(fn: any): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedFn = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.innerControl.disable();
        } else {
            this.innerControl.enable();
        }
    }

    private loadOnlyCurrentValue(): void {
        this.loadedOptions = [];
        let newValue: any = null;
        if (this.outerControl.value) {
            let currentlySelected: any = this.options.find((opt: any) => {
                let optValue: any = this.valueField ? opt[this.valueField] : opt;
                if (this.forceEmitObject) {
                    let outerValue: any = this.outerControl.value ? (this.valueField ? this.outerControl.value[this.valueField] : this.outerControl.value) : null;
                    if (optValue === outerValue) {
                        return true;
                    }
                } else {
                    return optValue === this.outerControl.value;
                }
            });
            if (currentlySelected) {
                newValue = currentlySelected;
                this.loadedOptions.push(currentlySelected);
            }
        }
        if (this.innerControl.value !== newValue) {
            this.ignoreInnerControlChanges = true;
            this.innerControl.setValue(newValue);
        }
    }

    private filterOptions(showAll: boolean = false): void {
        if (showAll || !this.innerControl.value) {
            this.forceShowNone = true;
            this.loadedOptions = this.options;
        } else {
            let searchValue: string = "";
            if (typeof this.innerControl.value === "string") {
                searchValue = this.innerControl.value.toLowerCase();
            } else if (this.displayField) {
                searchValue = this.innerControl.value[this.displayField].toLowerCase();
            }
            this.loadedOptions = this.options.filter((opt: any) => {
                let optDisplay: string = (this.displayField ? opt[this.displayField] : opt).toLowerCase();
                return optDisplay.includes(searchValue);
            });
            this.forceShowNone = this.loadedOptions.length === 0;
        }
    }

    public onOpened(): void {
        this.isOpen = true;
        this.onTouchedFn();
        this.inputElement.nativeElement.select(); // Highlights text

        setTimeout(() => {
            this.filterOptions(true);
            this.includeLoadingOption = false;
        });
    }

    public onClosed(): void {
        this.isOpen = false;
        if (!this.innerControl.value && this.outerControl.value) {
            this.selectOption(null);
        }

        setTimeout(() => {
            this.loadOnlyCurrentValue();
            this.includeLoadingOption = true;
        });
    }

    public selectOption(opt: any): void {
        let newVal: any = opt ? ((this.valueField && !this.forceEmitObject) ? opt[this.valueField] : opt) : null;
        if (this.noNgControl) {
            this.outerControl.setValue(newVal);
        }

        this.inputElement.nativeElement.blur();

        this.onChangeFn(newVal);
        this.optionSelected.emit(newVal);
    }

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.innerControlSubscription);
    }

}
