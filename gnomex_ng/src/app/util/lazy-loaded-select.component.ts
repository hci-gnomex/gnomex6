import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
    selector: 'lazy-loaded-select',
    template: `
        <mat-form-field class="full-width full-height">
            <mat-select [placeholder]="this.placeholder" [formControl]="this.control" 
                        (openedChange)="this.onOpenedChange($event)">
                <mat-option *ngIf="this.allowNone">None</mat-option>
                <mat-option *ngFor="let opt of this.loadedOptions" [value]="this.valueField ? opt[this.valueField] : opt">{{opt[this.displayField]}}</mat-option>
                <mat-option *ngIf="this.isLoading">Loading...</mat-option>
            </mat-select>
            <mat-error *ngIf="this.control.hasError('required')">{{this.placeholder}} is required</mat-error>
        </mat-form-field>
    `,
})

export class LazyLoadedSelectComponent implements OnInit, OnChanges, OnDestroy {

    @Input() placeholder: string;
    @Input() options: any[];
    @Input() valueField: string;
    @Input() displayField: string;
    @Input() allowNone: boolean;
    @Input() control: FormControl;

    public loadedOptions: any[] = [];
    public isLoading: boolean = false;

    private controlChangesSubscription: Subscription;

    constructor() {
    }

    ngOnInit(): void {
        this.loadOnlyCurrentValue();

        this.controlChangesSubscription = this.control.valueChanges.subscribe(() => {
            this.loadOnlyCurrentValue();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadOnlyCurrentValue();
    }

    private loadOnlyCurrentValue(): void {
        this.loadedOptions = [];
        if (this.control.value) {
            let currentlySelected: any = this.options.find((opt: any) => (this.valueField ? opt[this.valueField] === this.control.value : opt === this.control.value));
            if (currentlySelected) {
                this.loadedOptions.push(currentlySelected);
            }
        }
    }

    public onOpenedChange(val: boolean): void {
        if (val) {
            this.isLoading = true;
            setTimeout(() => {
                this.loadedOptions = this.options;
                this.isLoading = false;
            });
        } else {
            setTimeout(() => {
                this.loadOnlyCurrentValue();
            });
        }
    }

    ngOnDestroy(): void {
        if (this.controlChangesSubscription) {
            this.controlChangesSubscription.unsubscribe();
        }
    }

}
