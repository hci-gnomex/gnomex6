import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog} from "@angular/material";
import {DialogsService} from "../../util/popup/dialogs.service";

@Component({
    templateUrl:'./ep-experiment-type-tab.component.html',
    styles:[`
        .padded-checkbox{
            padding-top: 1.25rem;
        }
    `]
})

export class EpExperimentTypeTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    private expPlatformSubscription: Subscription;
    private expPlatformTypeSubscription: Subscription;
    private expPlatfromNode:any;
    private gridApi: GridApi;
    public applicationList:any[] = [];
    public showInactive = false;
    public selectedLibPrep:any[]=[];
    private selectedLibPrepIndex:number = -1;

    public rowData:any[]= [];

    private  _applicationTheme:any[];
    private _seqLibProtocolCol:any[];
    private _labelingProtocolCol:any[];
    private _hybProtocolCol:any[];
    private _scanProtocolCol:any[];
    private _feProtocolCol:any[];
    private newAppNumber:number;


    get applicationTheme():any[]{
        if(!this._applicationTheme){

            this._applicationTheme = this.dictionaryService.getEntries(DictionaryService.APPLICATION_THEME);
        }
        return this._applicationTheme;
    };
    get seqLibProtocolCol():any[]{
        if(!this._seqLibProtocolCol) {
            this._seqLibProtocolCol = this.dictionaryService.getEntries(DictionaryService.SEQ_LIB_PROTOCOL)
                .filter(protocol => protocol && protocol.isActive !== 'N'); // case where backend returns null sometimes
        }
        return this._seqLibProtocolCol;
    }
    get labelingProtocolCol():any[] {
        if(!this._labelingProtocolCol){
            this._labelingProtocolCol = this.dictionaryService.getEntries(DictionaryService.LABELING_PROTOCOL)
                .filter(protocol => protocol && protocol.isActive !== 'N');
        }
        return this._labelingProtocolCol;
    }
    get hybProtocolCol():any[]{
        if(!this._hybProtocolCol){
            this._hybProtocolCol = this.dictionaryService.getEntries(DictionaryService.HYB_PROTOCOL)
                .filter(protocol => protocol && protocol.isActive !== 'N');
        }
        return this._hybProtocolCol;
    }
    get scanProtocolCol():any[]{
        if(!this._scanProtocolCol){
            this._scanProtocolCol = this.dictionaryService.getEntries(DictionaryService.SCAN_PROTOCOL)
                .filter(protocol => protocol && protocol.isActive !== 'N');
        }
        return this._scanProtocolCol;
    }
    get feProtocolCol():any[]{
        if(!this._feProtocolCol){
            this._feProtocolCol = this.dictionaryService.getEntries(DictionaryService.FEATURE_EXTRACTION_PROTOCOL)
                .filter(protocol => protocol && protocol.isActive !== 'N');
        }
        return this._feProtocolCol;
    }

    public columnDefs: any[] = [];

    constructor(private fb:FormBuilder,private expPlatfromService:ExperimentPlatformService,
                public constService:ConstantsService,private dictionaryService:DictionaryService,
                private dialog: MatDialog,private dialogService:DialogsService){
    }

    ngOnInit(){
        this.formGroup = this.fb.group({applications:[]});
    }

    setColumnDefByState():any[]{
        let dynamicColDef:any[] = [
            {
                headerName: " ",
                field: "isSelected",
                cellRendererFramework: CheckboxRenderer,
                checkboxEditable: true,
                editable: false,
                width: 100
            },
            {
                headerName: "Experiment Type",
                field: "display",
                editable:true,
                width: 250
            },
        ];

        if(this.expPlatfromService.isIllumina){
            dynamicColDef =  dynamicColDef.concat([
                {
                    headerName: "Theme",
                    field: "idApplicationTheme",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.applicationTheme,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                },
                {
                    headerName: "Seq Lib Protocols",
                    field: "idSeqLibProtocols",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.seqLibProtocolCol,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                },
                {
                    headerName: "Custom Design Id",
                    field: "hasCaptureLibDesign",
                    cellRendererFramework: CheckboxRenderer,
                    checkboxEditable: true,
                    editable: false,
                    width: 100
                },

            ]);
        }
        if(this.expPlatfromService.isMicroarray){
            dynamicColDef =  dynamicColDef.concat([
                {
                    headerName: "Labeling Protocol",
                    field: "idLabelingProtocol",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.labelingProtocolCol,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                },
                {
                    headerName: "Hyb Protocol",
                    field: "idHybProtocol",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.hybProtocolCol,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                },
                {
                    headerName: "Scan Protocol",
                    field: "idScanProtocol",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.scanProtocolCol,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                },
                {
                    headerName: "FE Protocol",
                    field: "idFeatureExtractionProtocol",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.feProtocolCol,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    editable:true,
                    width: 200
                }

            ]);
        }
        if(this.expPlatfromService.isSequenom){
            dynamicColDef.push({
                headerName: "FE Protocol",
                field: "samplesPerBatch",
                editable:true,
                width: 200

            })
        }
        dynamicColDef.push({
            headerName: "Active",
            field: "isActive",
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true,
            editable: false,
            width: 100
        });

        return dynamicColDef;
    }

    onRowSelected(event){
        if(event.node.selected){
            this.selectedLibPrepIndex = event.rowIndex;
            this.gridApi.selectIndex(this.selectedLibPrepIndex, false, null);
        }
        this.selectedLibPrep = this.gridApi.getSelectedRows();
    }

    onGridReady(params:any){
        this.gridApi= params.api;
        //if hiseq, extra column is added for it
        this.expPlatformSubscription = this.expPlatfromService.getExperimentPlatformObservable()
            .subscribe(data =>{
                if(data && data.applications){
                    this.newAppNumber = 0;
                    this.expPlatfromNode = data;
                    let allApps = Array.isArray(data.applications) ? data.applications : [data.applications.Application];
                    this.applicationList = allApps.filter((app: any) => (app.isActive === "Y"));
                    this.showInactive = false;
                    this.filterAppOptions();
                    this.selectedLibPrep = [];
                    this.formGroup.get('applications').setValue(this.applicationList);
                    this.formGroup.markAsPristine();
                    this.columnDefs =  this.setColumnDefByState();
                    this.gridApi.setColumnDefs(this.columnDefs);
                    this.gridApi.setRowData(this.rowData);

                }
            });

        this.expPlatformTypeSubscription = this.expPlatfromService.getExperimentPlatformTypeChangeObservable()
            .subscribe(data => {
                this.columnDefs = this.setColumnDefByState();
                this.gridApi.setColumnDefs(this.columnDefs);
            });
    }

    filterAppOptions(event?: any) {
        // This is to filter the data that is executive(selected), but not to filter the data that is active in database.
        if(this.showInactive) {
            this.rowData = this.applicationList;
        } else {
            this.rowData = this.applicationList.filter(app => app.isSelected === "Y");
        }
    }

    externallyResizeGrid(){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }
    onGridSizeChanged(event){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }
    onCellValueChanged(event:CellValueChangedEvent):void {
        if(event.oldValue !== event.newValue){
            this.formGroup.markAsDirty();
            if(event.column.getColId() === "sortOrder"){
                //this.rowData.sort(this.sortSeqOptions);
                this.gridApi.setRowData(this.rowData);
            }
        }

    }

    add(){
        this.newAppNumber++;
        let newLibPrep = {
            isSelected: "Y",
            codeApplication: "Application" + this.newAppNumber,
            display:'',
            idSeqLibProtocols:'',
            idLabelingProtocolDefault:'',
            idHybProtocolDefault:'',
            idScanProtocolDefault:'',
            idFeatureExtractionProtocolDefault:'',
            isActive:'Y',
            RequestCategoryApplication: []
        };
        this.applicationList.splice(0, 0, newLibPrep);
        this.filterAppOptions();
        this.gridApi.setRowData(this.rowData);
        this.gridApi.forEachNode(node => node.rowIndex ? 0 : node.setSelected(true, true));
        this.formGroup.markAsDirty();

    }

    remove(){
        let libPrep = this.selectedLibPrep[0];
        this.dialogService.confirm("Are you sure you want to remove experiment type named "
            + libPrep.display + "?", "Remove Lib Prep").subscribe(result =>{
            if(result){
                let removeIndex:number = this.applicationList.indexOf(libPrep);
                if(removeIndex > -1){
                    this.applicationList.splice(removeIndex,1);
                    this.formGroup.markAsDirty();
                    this.selectedLibPrep = [];
                    this.filterAppOptions();
                    this.gridApi.setRowData(this.rowData);
                }
            }
        });

    }

    ngOnDestroy(){
        this.expPlatformSubscription.unsubscribe();
        this.expPlatformTypeSubscription.unsubscribe();
    }


}
