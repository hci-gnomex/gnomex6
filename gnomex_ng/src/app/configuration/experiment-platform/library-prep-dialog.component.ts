import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {numberRange} from "../../util/validators/number-range-validator";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {LibraryPrepProtocolDialogComponent} from "./library-prep-protocol-dialog.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {LibraryPrepStepsDialogComponent} from "./library-prep-steps-dialog.component";
import * as _ from "lodash";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    templateUrl: "./library-prep-dialog.component.html",
    styles: [`
        .medium-form-input{
            width: 30em
        }
    `]
})
export class LibraryPrepDialogComponent extends BaseGenericContainerDialog implements OnInit{

    rowData:any;
    uncomittedRowData:any;
    applyFn:any;
    appThemeList: string;
    isDirty = false;
    formGroup: FormGroup;
    reqCategoryAppList:any[];
    protocolParam: any;
    private expPlatformNode:any;
    private _indexFamily:any[];
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;
    public readonly applyText = "Apply";

    get indexFamily(){
        if(!this._indexFamily){
            this._indexFamily = this.dictionaryService.getEntries(DictionaryService.OLIGO_BARCODE_SCHEME)
                .filter(barcode => barcode.isActive === 'Y');
        }
        return this._indexFamily;
    }



    constructor(public constService:ConstantsService, private fb: FormBuilder,
                private dialogRef:MatDialogRef<LibraryPrepDialogComponent>,
                private expPlatformService: ExperimentPlatformService,
                private dictionaryService: DictionaryService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.appThemeList = this.data.appThemeList;
            this.expPlatformNode = this.data.expPlatformNode;
            this.formGroup = this.data.libPrepGroup;
        }
    }

    ngOnInit(){
        this.initSeqLibProtocol(this.rowData.idSeqLibProtocols); // don't see any case where there should be more than one idSeqLibProtocol
        this.rowData.application = this.rowData.display;
        this.uncomittedRowData = _.cloneDeep(this.rowData);

        this.formGroup = this.fb.group({
            application: [this.uncomittedRowData.application ? this.uncomittedRowData.application : '' , Validators.required] ,
            sortOrder: [this.uncomittedRowData.sortOrder ? this.uncomittedRowData.sortOrder : '', numberRange(0,99)],
            idApplicationTheme: this.uncomittedRowData.idApplicationTheme ? this.uncomittedRowData.idApplicationTheme : '',
            idBarcodeSchemeA: this.uncomittedRowData.idBarcodeSchemeA ? this.uncomittedRowData.idBarcodeSchemeA  : '',
            idBarcodeSchemeB: this.uncomittedRowData.idBarcodeSchemeB ? this.uncomittedRowData.idBarcodeSchemeB  : '',
            onlyForLabPrepped: this.uncomittedRowData.onlyForLabPrepped === 'Y' ? 'Y' : 'N',
            unitPriceInternal: [this.uncomittedRowData.unitPriceInternal ? this.uncomittedRowData.unitPriceInternal : '0.00', Validators.pattern(this.currencyRegex)],
            unitPriceExternalAcademic: [this.uncomittedRowData.unitPriceExternalAcademic ? this.uncomittedRowData.unitPriceExternalAcademic : '0.00', Validators.pattern(this.currencyRegex)],
            unitPriceExternalCommercial: [this.uncomittedRowData.unitPriceExternalCommercial? this.uncomittedRowData.unitPriceExternalCommercial: '0.00', Validators.pattern(this.currencyRegex)],
            hasCaptureLibDesign: this.uncomittedRowData.hasCaptureLibDesign ? this.uncomittedRowData.hasCaptureLibDesign === 'Y' : false ,
            idSeqLibProtocols: this.uncomittedRowData.idSeqLibProtocols ? this.uncomittedRowData.idSeqLibProtocols : '' ,
            coreSteps: this.uncomittedRowData.coreSteps ? this.uncomittedRowData.coreSteps : '',
            coreStepsNoLibPrep: this.uncomittedRowData.coreStepsNoLibPrep ? this.uncomittedRowData.coreStepsNoLibPrep : ''

        });
        this.reqCategoryAppList = Array.isArray(this.uncomittedRowData.RequestCategoryApplication) ? this.uncomittedRowData.RequestCategoryApplication
            : [this.uncomittedRowData.RequestCategoryApplication];
        for(let app of this.reqCategoryAppList){
            this.formGroup.addControl(app.value, new FormControl(app.isSelected === 'Y'))
        }

        this.primaryDisable = (action) => {return this.formGroup.invalid; };
        this.dirty = () => {return this.formGroup.dirty; };
    }
    compareByID(obj1,item2){
        return obj1 && item2 && obj1.value === item2;
    }

    initSeqLibProtocol(idSeqLibProtocol:string){
        if(idSeqLibProtocol.split(',').length > 1){
            this.dialogService.alert("It appears mutiple seq protocols are associated with this application." +
                "Editing the protocol may cause issues. Please notify GNomEx Support ");
        }else if(idSeqLibProtocol){
            let tempProtocolParam = this.dictionaryService.getEntry(DictionaryService.SEQ_LIB_PROTOCOL,idSeqLibProtocol);
            if(tempProtocolParam){
                this.protocolParam = tempProtocolParam;
            }else {// a new protocol saved but not saved to an application yet
                this.protocolParam = {idSeqLibProtocol: idSeqLibProtocol};
            }

        }

    }

    showReqCategoryCheckbox(app:any):boolean{
        return app.isActive === 'Y' && app.idCoreFacility === this.expPlatformNode.idCoreFacility;
    }

    private saveProtocolFn = (protocol:any)=> {
        this.formGroup.get('idSeqLibProtocols').setValue(protocol.idProtocolSaved);
        this.protocolParam = {idSeqLibProtocol : protocol.idProtocolSaved}

    };


    openProtocolEditor(){
        let config: MatDialogConfig = new MatDialogConfig();
        if(this.protocolParam){
            config.data = {
                protocol: this.protocolParam,
                saveProtocolFn: this.saveProtocolFn
            };
        }else{
            config.data = {
                saveProtocolFn: this.saveProtocolFn
            };
        }

        this.dialogService.genericDialogContainer(LibraryPrepProtocolDialogComponent, "Edit Library Prep", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "saveChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});

    }
    private applySteps = (core:string, lab:string ) =>{
        if(core != this.formGroup.get('coreSteps').value || lab != this.formGroup.get('coreStepsNoLibPrep').value ){
            this.formGroup.get('coreSteps').setValue(core);
            this.formGroup.get('coreStepsNoLibPrep').setValue(lab);
            this.uncomittedRowData.coreSteps = core;
            this.uncomittedRowData.coreStepsNoLibPrep = lab;
            this.formGroup.markAsDirty();
        }
    };

    openStepsEditor(){
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            applyStepsFn: this.applySteps,
            rowData: this.uncomittedRowData
        };
        config.width = '65em';

        this.dialogService.genericDialogContainer(LibraryPrepStepsDialogComponent, "Lib Prep Steps", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Apply", internalAction: "applyChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});

    }

    applyLibPrepChanges(){
        this.applyFn(this.formGroup);
        this.dialogRef.close();
    }

}
