import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProtocolService} from "../services/protocol.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {Subscription} from "rxjs/Subscription";
import {SpinnerDialogComponent} from "../util/popup/spinner-dialog.component";
import {MatDialogRef} from "@angular/material";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {DictionaryService} from "../services/dictionary.service";

@Component({
    selector: 'edit-protocol',
    templateUrl: 'edit-protocol.component.html',
    styles: [`
        .flex-grow { flex: 1; }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }

        .inline-block { display: inline-block; }

        .vertical-center { vertical-align: middle; }

        .padded { padding: 0.4em; }

        .padded-right { padding-right: 0.4em; }

        .padded-left-right {
            padding-left: 0.4em;
            padding-right: 0.4em;
        }
        .padded-top-bottom {
            padding-top: 0.4em;
            padding-bottom: 0.4em;
        }

        .border { border: 1px lightgray solid; }

        .no-overflow { overflow: hidden; }
        .right-align { text-align: right; }

        .checkbox-container {
            display: inline-block;
            vertical-align: middle;
            width: fit-content;
            padding: 0.2em 0.6em 0 0.6em;
        }

        .minimize {
            width: fit-content;
        }

        .special-checkbox-text-alignment-padding {
            padding: 1.6em 0.6em 0 0;
        }
        .special-button-text-alignment-padding {
            padding: 1.1em 0.6em 0 0.6em;
        }

        .warning-block {
            background: yellow;
            border: 1px lightgray solid;
            border-radius: 4px;
        }
    `]
})
export class EditProtocolComponent implements OnInit, OnDestroy {

    @Input('spinnerNeedsToWait') spinnerNeedsToWaitForList: boolean = false;

    @Output('protocolLoaded') protocolLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected mainPaneTitle: string = 'Protocol:';

    protected selectedProtocol: any;

    protected activeCheckBox: boolean = false;
    protected protocolId: string;
    protected protocolClassName: string;
    protected selectedProtocolName: string;
    protected selectedProtocolDescription: string;
    protected selectedExperimentPlatformCodeRequestCategory: string;
    protected selectedProtocolUrl: string;
    protected selectedProtocolIdAnalysisType: string;
    protected selectedProtocolIdAppUser: string;

    protected accountNameFormControl         = new FormControl('', [ ]);
    protected experimentPlatformFormControl  = new FormControl('', [ ]);
    protected analysisTypeFormControl        = new FormControl('', [ ]);
    protected ownerFormControl               = new FormControl('', [ ]);
    protected activeFormControl              = new FormControl('', [ ]);
    protected urlFormControl                 = new FormControl('', [ ]);
    protected protocolDescriptionFormControl = new FormControl('', [ ]);


    protected analysisTypeList: any[];
    protected experimentPlatformList: any[];
    protected userList: any[];

    protected disableViewURLButton: boolean = true;

    private routeParameterSubscription: Subscription;
    private protocolSubscription: Subscription;
    private saveExistingProtocolSubscription: Subscription;

    private spinnerOpenSubscription: Subscription;
    private spinnerClosedSubscription: Subscription;

    private spinnerRef: MatDialogRef<SpinnerDialogComponent>;
    private spinnerIsOpened: boolean = false;

    constructor(private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private protocolService: ProtocolService,
                private route: ActivatedRoute,
                private router: Router) { }

    ngOnInit(): void {

        if (!this.protocolSubscription) {
            this.protocolSubscription = this.protocolService.getProtocolObservable().subscribe((result) => {
                this.selectedProtocol = result;

                this.selectedProtocolName                          = !!result.name ? '' + result.name: '';
                this.selectedProtocolDescription                   = !!result.description ? '' + result.description: '';
                this.selectedExperimentPlatformCodeRequestCategory = result.codeRequestCategory;
                this.selectedProtocolIdAppUser                     = !!result.idAppUser ? '' + result.idAppUser: '';
                this.activeCheckBox                                = ('' + result.isActive).toLowerCase() === 'y';
                this.selectedProtocolUrl                           = !!result.url  ? '' + result.url:  '';

                if (this.selectedProtocolUrl && this.selectedProtocolUrl !== "") {
                    this.disableViewURLButton = false;
                } else {
                    this.disableViewURLButton = true;
                }
                if (result.idAnalysisType && result.idAnalysisType !== '') {
                    this.selectedProtocolIdAnalysisType = result.idAnalysisType;
                } else {
                    this.selectedProtocolIdAnalysisType = '';
                }

                this.accountNameFormControl.markAsPristine();
                this.experimentPlatformFormControl.markAsPristine();
                this.activeFormControl.markAsPristine();
                this.urlFormControl.markAsPristine();
                this.protocolDescriptionFormControl.markAsPristine();
                this.ownerFormControl.markAsPristine();
                this.analysisTypeFormControl.markAsPristine();

                this.protocolLoaded.emit(true);
                if (!this.spinnerNeedsToWaitForList) {
                    this.spinnerRef.close();
                }
            });
        }

        if (!this.saveExistingProtocolSubscription) {
            this.saveExistingProtocolSubscription = this.protocolService.getSaveExistingProtocolObservable().subscribe((result) => {
                this.spinnerRef.close();

                this.refresh();
            });
        }


        // if (!this.spinnerRef) {
        //
        //     setTimeout(() => {
        //         if (!this.spinnerRef && !this.spinnerIsOpened) {
        //             this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
        //         }
        //
        //         setTimeout(() => {
        //             if (!this.spinnerOpenSubscription) {
        //                 this.spinnerOpenSubscription = this.spinnerRef.afterOpen().subscribe(() => {
        //                     this.spinnerIsOpened = true;
        //                 });
        //             }
        //
        //             if (!this.spinnerClosedSubscription) {
        //                 this.spinnerClosedSubscription = this.spinnerRef.afterOpen().subscribe(() => {
        //                     this.spinnerIsOpened = false;
        //                 });
        //             }
        //
        //             this.spinnerRef.close();
        //         });
        //     });
        // } else {
        //     if (!this.spinnerOpenSubscription) {
        //         this.spinnerOpenSubscription = this.spinnerRef.afterOpen().subscribe(() => {
        //             this.spinnerIsOpened = true;
        //         });
        //     }
        //
        //     if (!this.spinnerClosedSubscription) {
        //         this.spinnerClosedSubscription = this.spinnerRef.afterOpen().subscribe(() => {
        //             this.spinnerIsOpened = false;
        //         });
        //     }
        // }

        this.analysisTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.experimentPlatformList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.userList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APP_USER);


        if (this.route && this.route.params && !this.routeParameterSubscription) {
            this.routeParameterSubscription = this.route.params.subscribe((params) => {
                this.protocolId = params['id'];
                this.protocolClassName = params['modelName'];

                this.dialogService.stopAllSpinnerDialogs();

                if (!this.spinnerRef) {

                    setTimeout(() => {
                        if (!this.spinnerRef && !this.spinnerIsOpened) {
                            this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
                        }

                        setTimeout(() => {
                            if (!this.spinnerOpenSubscription) {
                                this.spinnerOpenSubscription = this.spinnerRef.afterOpen().subscribe(() => {
                                    this.spinnerIsOpened = true;
                                });
                            }

                            if (!this.spinnerClosedSubscription) {
                                this.spinnerClosedSubscription = this.spinnerRef.afterOpen().subscribe(() => {
                                    this.spinnerIsOpened = false;
                                });
                            }

                            this.spinnerRef.close();
                        });
                    });
                } else {
                    if (!this.spinnerOpenSubscription) {
                        this.spinnerOpenSubscription = this.spinnerRef.afterOpen().subscribe(() => {
                            this.spinnerIsOpened = true;
                        });
                    }

                    if (!this.spinnerClosedSubscription) {
                        this.spinnerClosedSubscription = this.spinnerRef.afterOpen().subscribe(() => {
                            this.spinnerIsOpened = false;
                        });
                    }
                }

                if (this.protocolId && this.protocolClassName) {
                    if (!this.spinnerIsOpened) {
                        this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
                    }

                    this.protocolService.getProtocolByIdAndClass(this.protocolId, this.protocolClassName);
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.protocolSubscription) {
            this.protocolSubscription.unsubscribe();
        }
        if (this.saveExistingProtocolSubscription) {
            this.saveExistingProtocolSubscription.unsubscribe();
        }
        if (this.spinnerOpenSubscription) {
            this.spinnerOpenSubscription.unsubscribe();
        }
        if (this.spinnerClosedSubscription) {
            this.spinnerClosedSubscription.unsubscribe();
        }
        if (this.routeParameterSubscription) {
            this.routeParameterSubscription.unsubscribe();
        }
    }

    private refresh(): void {
        if (!this.spinnerIsOpened) {
            this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
        }

        if (this.protocolId && this.protocolClassName) {
            this.protocolService.getProtocolByIdAndClass(this.protocolId, this.protocolClassName);
        }
        this.protocolService.getProtocolList();
    }

    private checkToEnableViewURLButton(event: any) {
        if (event && event.currentTarget && event.currentTarget.value && event.currentTarget.value !== "") {
            this.disableViewURLButton = false;
        } else {
            this.disableViewURLButton = true;
        }
    }

    protected isAnyFieldNotPristine(): boolean {
        return this.accountNameFormControl.dirty
            || this.experimentPlatformFormControl.dirty
            || this.analysisTypeFormControl.dirty
            || this.ownerFormControl.dirty
            || this.activeFormControl.dirty
            || this.urlFormControl.dirty
            || this.protocolDescriptionFormControl.dirty;
    }

    private onViewURLButtonClicked() {
        window.open(this.selectedProtocolUrl, '_blank');
    }

    private onSaveButtonClicked() {
        if (this.selectedProtocol) {
            if (!this.spinnerIsOpened) {
                this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();
            }

            this.protocolService.saveExistingProtocol(
                '' + this.selectedProtocolName,
                '' + this.selectedProtocolDescription,
                '' + this.selectedProtocolIdAnalysisType,
                '' + this.protocolClassName,
                '' + this.selectedExperimentPlatformCodeRequestCategory,
                '' + this.selectedProtocolIdAppUser,
                (this.activeCheckBox ? 'Y' : 'N'),
                '' + this.protocolId,
                '' + this.selectedProtocolUrl
            );
        }
    }
}