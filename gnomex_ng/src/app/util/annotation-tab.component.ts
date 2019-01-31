/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IAnnotation} from "./interfaces/annotation.model";
import {selectRequired} from "./validators/select-required.validator";
import {
    MatDialog, MatDialogConfig,
    MatDialogRef, MatSelectChange
} from "@angular/material";
import {ConfigAnnotationDialogComponent} from "./config-annotation-dialog.component";
import {BrowseOrderValidateService} from "../services/browse-order-validate.service";
import {IAnnotationOption} from "./interfaces/annotation-option.model";
import {Subscription} from "rxjs";

export enum OrderType {
    ANALYSIS = 'a',
    DATATRACK = 'dt',
    EXPERIMENT = 'e',
    NONE = ''
}


@Component({
    selector: 'annotation-tab',
    templateUrl: './annotation-tab.component.html',

    styles: [`


        .annot-control {
            width: 30%;
            margin: 0.25em;
            font-size: small;
        }

        .mat-tab-group-border {
            border: 1px solid #e8e8e8;
        }


    `]
})
export class AnnotationTabComponent implements OnInit, OnDestroy {
    private readonly TEXT: string = "TEXT";
    private readonly CHECK: string = "CHECK";
    private readonly OPTION: string = "OPTION";
    private readonly MOPTION: string = "MOPTION";
    private readonly URL: string = "URL";

    public form: FormGroup;

    private _annotations: IAnnotation[];
    private _disabled: boolean = false;

    @Input() orderType = OrderType.NONE;
    private orderValidateSubscription: Subscription;

    @Input()
    set disabled(value: boolean) {
        this._disabled = value;
        if (this.form) {
            if (this._disabled) {
                this.form.disable()
            } else {
                this.form.enable();
            }
        }
    }

    @Input()
    set annotations(a: IAnnotation[]) {
        this._annotations = a;

        if (!this.form) {
            this.form = new FormGroup({});
        }

        if (this._annotations) {
            this._annotations.forEach(annot => {
                this.form.addControl(annot.name, new FormControl());

                if (annot.codePropertyType === this.TEXT) {
                    this.form.controls[annot.name].setValue(annot.value);
                } else if (annot.codePropertyType === this.CHECK) {
                    this.form.controls[annot.name].setValue(annot.value === 'Y');
                } else if (annot.codePropertyType === this.MOPTION) {
                    let selectedOpts: IAnnotationOption[] = [];

                    for (let opt  of annot.PropertyOption) {
                        if (opt.selected === 'Y') {
                            selectedOpts.push(opt);
                        }
                    }

                    this.form.controls[annot.name].setValue(selectedOpts);
                } else if (annot.codePropertyType === this.OPTION) {
                    for (let opt  of annot.PropertyOption) {
                        if (opt.selected === 'Y') {
                            this.form.controls[annot.name].setValue(opt);
                            break;
                        }
                    }
                } else if (annot.codePropertyType === this.URL) {
                    this.form.controls[annot.name].setValue(annot);
                }

                if (annot.isRequired === 'Y') {
                    if (annot.codePropertyType === this.TEXT) {
                        this.form.controls[annot.name].setValidators([Validators.required]);
                    } else if (annot.codePropertyType === this.CHECK) {
                        this.form.controls[annot.name].setValidators([Validators.requiredTrue]);
                    } else if (annot.codePropertyType === this.MOPTION || annot.codePropertyType === this.OPTION) {
                        this.form.controls[annot.name].setValidators(selectRequired());
                    }
                }
            });
        }

        this.form.markAsPristine();
    }

    get annotations() {
        return this._annotations;
    }

    public prepAnnotationForSave = () => {
        let annotationToSave: IAnnotation[] = [];

        for (let annot of this._annotations) {

            if (annot.codePropertyType === this.TEXT) {
                annot.value = this.form.controls[annot.name].value;
                annotationToSave.push(annot);
            } else if (annot.codePropertyType === this.CHECK) {
                annot.value = this.form.controls[annot.name].value ? 'Y' : 'N';
                annotationToSave.push(annot);
            } else if (annot.codePropertyType === this.OPTION) {
                annot.value = '';
                annotationToSave.push(annot);

            } else if (annot.codePropertyType === this.MOPTION) {
                let mOptList = <IAnnotationOption[]>this.form.controls[annot.name].value;
                annot.value = '';
                for (let i = 0; i < mOptList.length; i++) {
                    if (i < mOptList.length - 1) {
                        annot.value += mOptList[i].name + ","
                    } else {
                        annot.value += mOptList[i].name;
                    }
                }
                annotationToSave.push(annot);

            } else if (annot.codePropertyType === this.URL) {
                annotationToSave.push(this.form.controls[annot.name].value);
            }
        }
        this.orderValidateService.annotationsToSave = annotationToSave;

    };


    constructor(private dialog: MatDialog,
                private orderValidateService: BrowseOrderValidateService) {
    }

    ngOnInit() {
        if (this._disabled) {
            this.form.disable();
        } else {
            this.form.enable();
        }

        this.orderValidateSubscription = this.orderValidateService.getOrderValidateObservable().subscribe(this.prepAnnotationForSave);
    }

   


    loadConfigAnnotations() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.maxHeight = '80%';
        configuration.data = {orderType: this.orderType};

        let dialogRef: MatDialogRef<ConfigAnnotationDialogComponent> = this.dialog.open(ConfigAnnotationDialogComponent, configuration);
    }


    selectOpt(opt: any) { // on mat option
        let selected: boolean = opt.selected;
        opt.value.selected = selected ? 'Y' : 'N';
    }

    selectChanged(opt: MatSelectChange, annot:IAnnotation) { // on mat select
        for(let opt of annot.PropertyOption){
            opt.selected = 'N';
        }
        opt.value.selected = 'Y';
    }


    compareByID(itemOne, itemTwo) {
        return itemOne && itemTwo && itemOne.name == itemTwo.name;
    }
    
    ngOnDestroy(): void {
        this.orderValidateSubscription.unsubscribe;
    }

}

