import {
    AfterViewInit,
    Component, ElementRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    Output, SimpleChange,
    SimpleChanges, ViewChild,
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import {Subscription} from "rxjs";
import {UtilService} from "../services/util.service";
import {debounceTime} from "rxjs/operators";
import {MatSelect} from "@angular/material";

@Component({
    selector: "custom-multi-combo-box",
    template: `
        <div class="full-height full-width flex-container-row align-center">
            <mat-form-field class="flex-grow" [matTooltip]="this.tooltip">
                <input #input matInput name="customMultiComboBoxFilter" class="ellipsis"
                       (focus)="this.onInputFocus()"
                       autocomplete="off"
                       [placeholder]="this.temporaryPlaceholder ? (this.outerControl.value && this.outerControl.value.length ? '' : this.placeholder) : this.placeholder"
                       [formControl]="this.innerControl">
            </mat-form-field>
            <div>
                <mat-select #select [multiple]="true"
                            (selectionChange)="this.selectOptions($event.value)"
                            (openedChange)="this.onOpenedChange($event)">
                    <mat-option *ngFor="let opt of this.loadedOptions" [value]="opt">
                        {{this.displayField ? opt[this.displayField] : opt}}
                    </mat-option>
                    <mat-option *ngIf="this.includeLoadingOption">Loading...</mat-option>
                    <mat-option *ngIf="!this.includeLoadingOption && !this.options.length">None</mat-option>
                </mat-select>
            </div>
        </div>
    `,
    styles: [`
    `],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomMultiComboBoxComponent,
        multi: true,
    }],
})

export class CustomMultiComboBoxComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
    @ViewChild("input") inputElement: ElementRef;
    @ViewChild("select") selectElement: MatSelect;

    @Input() public placeholder: string = "";
    @Input() public temporaryPlaceholder: boolean = false;
    @Input() public tooltip: string = "";

    @Input() private options: any[] = [];
    public includeLoadingOption: boolean = true;
    public loadedOptions: any[] = [];
    private isSelectOpen: boolean = false;

    @Input() private valueField: string;
    @Input() public displayField: string;

    private outerControl: AbstractControl = new FormControl([]);
    public innerControl: FormControl = new FormControl("");
    private ignoreInnerControlChanges: boolean = false;
    private innerControlSubscription: Subscription;
    private noNgControl: boolean = false;

    private onChangeFn: (val: any) => void = () => {};
    private onTouchedFn: () => void = () => {};

    @Output() selectionChanged: EventEmitter<any[]> = new EventEmitter<any[]>();

    constructor(private injector: Injector) {
    }

    ngAfterViewInit(): void {
        let ngControl: NgControl = this.injector.get(NgControl, null);
        if (ngControl && ngControl.control) {
            this.outerControl = ngControl.control;
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
        }

        this.loadOnlyCurrentValue();
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
            this.selectElement.disabled = true;
        } else {
            this.innerControl.enable();
            this.selectElement.disabled = false;
        }
    }

    public onInputFocus(): void {
        this.selectElement.open();
    }

    private loadOnlyCurrentValue(): void {
        this.loadedOptions = [];
        if (this.outerControl.value && this.outerControl.value.length) {
            for (let opt of this.options) {
                let optValue: any = this.valueField ? opt[this.valueField] : opt;
                if (this.outerControl.value.includes(optValue)) {
                    this.loadedOptions.push(opt);
                }
            }
        }
        this.selectElement.value = this.loadedOptions;


        let currentValueLabel: string = "";
        for (let opt of this.loadedOptions) {
            if (currentValueLabel) {
                currentValueLabel += ", ";
            }
            currentValueLabel += this.displayField ? opt[this.displayField] : opt;
        }
        this.ignoreInnerControlChanges = true;
        this.innerControl.setValue(currentValueLabel);
    }

    private filterOptions(showAll: boolean = false): void {
        if (showAll || !this.innerControl.value) {
            this.loadedOptions = this.options;
        } else {
            let searchValue: string = this.innerControl.value.toLowerCase();
            this.loadedOptions = this.options.filter((opt: any) => {
                let currentValue: any[] = this.outerControl.value && this.outerControl.value.length ? this.outerControl.value : [];
                let optValue: any = this.valueField ? opt[this.valueField] : opt;
                let optDisplay: string = (this.displayField ? opt[this.displayField] : opt).toLowerCase();
                return optDisplay.includes(searchValue) || currentValue.includes(optValue);
            });
        }
    }

    public onOpenedChange(opened: boolean): void {
        this.isSelectOpen = opened;
        if (opened) {
            this.onTouchedFn();

            this.inputElement.nativeElement.focus();
            this.ignoreInnerControlChanges = true;
            this.innerControl.setValue("");

            setTimeout(() => {
                this.filterOptions(true);
                this.includeLoadingOption = false;
            });
        } else {
            setTimeout(() => {
                this.loadOnlyCurrentValue();
                this.includeLoadingOption = true;
            });
        }
    }

    public selectOptions(options: any[]): void {
        let newVal: any[] = [];
        for (let opt of options) {
            if (opt) {
                newVal.push(this.valueField ? opt[this.valueField] : opt);
            }
        }
        if (this.noNgControl) {
            this.outerControl.setValue(newVal);
        }

        this.onChangeFn(newVal);
        this.selectionChanged.emit(newVal);

        if (this.isSelectOpen) {
            this.inputElement.nativeElement.focus();
        }
    }

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.innerControlSubscription);
    }

}
