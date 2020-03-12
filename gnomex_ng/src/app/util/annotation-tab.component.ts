import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IAnnotation} from "./interfaces/annotation.model";
import {selectRequired} from "./validators/select-required.validator";
import {MatDialogConfig} from "@angular/material";
import {BrowseOrderValidateService} from "../services/browse-order-validate.service";
import {IAnnotationOption} from "./interfaces/annotation-option.model";
import {AnnotationService} from "../services/annotation.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {ActionType} from "./interfaces/generic-dialog-action.model";
import {ConfigureAnnotationsComponent} from "./configure-annotations.component";
import {DialogsService} from "./popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";

export enum OrderType {
    ANALYSIS = 'a',
    DATATRACK = 'dt',
    EXPERIMENT = 'e',
    SAMPLE = 's',
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

    @Input("showConfigureAnnotationsButton") public set showConfigureAnnotationsButton(value: boolean) {
        this._showConfigureAnnotationsButton = value;
    };
    public get showConfigureAnnotationsButton(): boolean {
        return this._showConfigureAnnotationsButton;
    }

    private _showConfigureAnnotationsButton: boolean = true;

    @Input() orderType = OrderType.NONE;
    private orderValidateSubscription: Subscription;

    @Input()
    set disabled(value: boolean) {
        this._disabled = value;
        if (this.form) {
            if (this._disabled) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        }
    }
    get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    set annotations(a: IAnnotation[]) {
        this._annotations = a;

        if (!this.form) {
            this.form = new FormGroup({});
        }

        if (this._annotations) {
            this._annotations = this._annotations.sort(AnnotationService.sortProperties);

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
                        // this.form.controls[annot.name].setValidators([Validators.requiredTrue]);
                    } else if (annot.codePropertyType === this.MOPTION || annot.codePropertyType === this.OPTION) {
                        this.form.controls[annot.name].setValidators(selectRequired());
                    }
                }
            });
        }

        if (this._disabled) {
            this.form.disable();
        } else {
            this.form.enable();
        }

        this.form.markAsPristine();
    }

    @Input("experimentAnnotations") public set experimentAnnotations(subject: BehaviorSubject<any[]>) {
        this.experimentAnnotations_subject = subject;
    }

    private experimentAnnotations_subject: BehaviorSubject<any>;

    @Input("getExperimentAnnotationsSubject") public set getExperimentAnnotationsSubject(subject: BehaviorSubject<any[]>) {
        if (!this.getExperimentAnnotationsSubject_subscription && subject) {
            this.getExperimentAnnotationsSubject_subscription = subject.subscribe((value: any[]) => {
                this.prepAnnotationForSave();
            });
        }
    }

    private getExperimentAnnotationsSubject_subscription: Subscription;

    get annotations() {
        return this._annotations;
    }

    public prepAnnotationForSave = () => {
        let annotationToSave: IAnnotation[] = [];

        if (this._annotations && Array.isArray(this._annotations)) {
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
        }

        this.orderValidateService.annotationsToSave = annotationToSave;
        if (this.experimentAnnotations_subject) {
            this.experimentAnnotations_subject.next(annotationToSave);
        }
    };


    constructor(private dialogsService: DialogsService,
                private constService: ConstantsService,
                private orderValidateService: BrowseOrderValidateService) {
    }

    ngOnInit() {
        if (!this.form) {
            this.form = new FormGroup({});
        }

        if (this._disabled) {
            this.form.disable();
        } else {
            this.form.enable();
        }

        this.orderValidateSubscription = this.orderValidateService.getOrderValidateObservable().subscribe(this.prepAnnotationForSave);
    }


    loadConfigAnnotations() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "82em";
        configuration.height = "60em";
        configuration.autoFocus = false;
        configuration.data = {
            isDialog: true,
            orderType: this.orderType
        };

        this.dialogsService.genericDialogContainer(ConfigureAnnotationsComponent, "Configure Annotations", null, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                ]});

    }


    selectOpts(opts: any[], annot: IAnnotation) {
        for (let opt of annot.PropertyOption) {
            opt.selected = 'N';
        }
        for (let opt of opts) {
            opt.selected = 'Y';
        }
    }

    selectChanged(opt: any, annot:IAnnotation) { // on mat select
        for(let opt of annot.PropertyOption){
            opt.selected = 'N';
        }
        if (opt) {
            opt.selected = 'Y';
        }
    }
    
    ngOnDestroy(): void {
        if (this.orderValidateSubscription) {
            this.orderValidateSubscription.unsubscribe();
        }

        if (this.getExperimentAnnotationsSubject_subscription) {
            this.getExperimentAnnotationsSubject_subscription.unsubscribe();
        }
    }
}

