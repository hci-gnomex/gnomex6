import {Component, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ConstantsService} from "../../services/constants.service";
import {GridApi} from "ag-grid";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {SampleTypeDetailDialogComponent} from "./sample-type-detail-dialog.component";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
//assets/page_add.png

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="flex-grow flex-container-row"  >
                <button type="button" mat-button color="primary" (click)="select()" >
                    {{selectedState}}
                </button>
                <button mat-button color="primary"
                        type="button"
                        (click)="addSampleType()">
                    <img [src]="this.constService.ICON_ADD"> Add
                </button>
                <button [disabled]="selectedSampleTypeRows.length === 0"
                        (click)="removeSampleType()"
                        mat-button color="primary"
                        type="button">
                    <img [src]="this.constService.ICON_DELETE"> Remove
                </button>
                <button mat-button
                        color="primary"
                        (click)="openSampleTypeEditor()"
                        [disabled]="selectedSampleTypeRows.length === 0"
                        type="button"> Edit Notes </button>
                
            </div>
            <div style="flex:9" class="full-width">
                <ag-grid-angular class="full-height full-width ag-fresh"
                                 [context]="context"
                                 [columnDefs]="columnDefs"
                                 (cellValueChanged)="onCellValueChanged($event)"
                                 [rowData]="this.sampleTypeRowData"
                                 (gridReady)="onGridReady($event)"
                                 (gridSizeChanged)="onGridSizeChanged($event)"
                                 [rowDeselection]="true"
                                 [rowSelection]="'single'"
                                 (rowSelected)="this.onSampleTypeRowSelected($event)"
                                 [stopEditingWhenGridLosesFocus]="true">
                </ag-grid-angular>

            </div>
            


        </div>
    `,
    styles:[`
        .no-padding-dialog .mat-dialog-container {
            padding: 0;
        }
    `]
})

export class EpSampleTypeTabComponent implements OnInit{
    public formGroup:FormGroup;
    public selectedState:string = "Select all";
    public currentSelectedIndex:number = -1;
    public selectedSampleTypeRows:any[] = [];
    private gridApi:GridApi;
    private sampleTypeList:any[];
    private _nucleotideTypeDataProvider:any[];
    public context;
    private sampleTypeDialogRef: MatDialogRef<SampleTypeDetailDialogComponent>;
    private expPlatformNode: any;



    public sampleTypeRowData:any[] = [];
    get nucleotideTypeDataProvider():any[]{
        if(!this._nucleotideTypeDataProvider){
            this._nucleotideTypeDataProvider = this.dictionaryService.getEntries(DictionaryService.NUCLEOTIDE_TYPE);
            this._nucleotideTypeDataProvider.splice(0,1);
        }
        return this._nucleotideTypeDataProvider;
    }
    private parseSortOrder(params){
        if(Number.isNaN(Number.parseInt(params.newValue))){
            return '';
        }
        let newVal:number = +params.newValue;
        if(newVal < 0 || newVal > 99){
            return '';
        }
        return params.newValue;
    }
    private applySampleTypeNotesFn = (dirty:boolean) => {
        if(dirty){
            this.expPlatfromService.findExpPlatformFormMember(this.constructor.name).markAsDirty();
        }

    };


    private sortSampleTypefn = (obj1,obj2) => {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let c1:string = obj1.codeNucleotideType;
            let c2:string = obj2.codeNucleotideType;
            if (c1 < c2) {
                return -1;
            } else if (c1 > c2) {
                return 1;
            } else {
                let s1:number = +obj1.sortOrder;
                let s2:number = +obj2.sortOrder;
                if (s1 < s2) {
                    return -1;
                } else if (s1 > s2) {
                    return 1;
                } else {
                    let n1:string = obj1.display;
                    let n2:string = obj2.display;
                    if (n1 < n2) {
                        return -1;
                    } else if (n1 > n2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }

    };


    public columnDefs=[
        {
            headerName: "Active",
            field: "isSelected",
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true,
            editable: false,
            width: 100
        },
        {
            headerName: "Sample Type",
            field: "display",
            editable: true,
            width: 300
        },
        {
            headerName: "Sample Category",
            field: "codeNucleotideType",
            cellEditorFramework: SelectEditor,
            selectOptions: this.nucleotideTypeDataProvider,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "codeNucleotideType",
            editable: true,
            width:300
        },
        {
            headerName: "Sort Order",
            field: "sortOrder",
            valueParser: this.parseSortOrder,
            editable:true,
            width: 100
        }

    ];

    constructor(private fb:FormBuilder,private constService:ConstantsService,
                private expPlatfromService: ExperimentPlatformService,
                private gnomexService:GnomexService,
                private dictionaryService:DictionaryService,
                private dialog: MatDialog){
        this.context = {componentParent:this};

    }

    ngOnInit(){
        this.formGroup = this.fb.group({});
        this.expPlatfromService.getExperimentPlatformObservable()
            .subscribe(resp =>{
                if(resp && !resp.message) {
                    this.expPlatformNode = resp;
                    this.sampleTypeList = Array.isArray(resp.sampleTypes) ? resp.sampleTypes : [resp.sampleTypes];
                    this.sampleTypeList.sort(this.sortSampleTypefn);
                    this.sampleTypeRowData = this.sampleTypeList;
                   this.formGroup.markAsPristine();
                }
            });

    }

    onGridReady(params:any){
        this.gridApi= params.api;
    }


    select(){
        if( this.selectedState ===  "Select all"){
            this.selectedState = "Unselect all";
            this.sampleTypeRowData.map(type => {
                type.isSelected = "Y";
                return type;
            });

        }else{
            this.selectedState = "Select all";
            this.sampleTypeRowData.map(type => {
                type.isSelected = "N";
                return type;
            });
        }
        this.gridApi.setRowData(this.sampleTypeRowData);
        this.expPlatfromService.findExpPlatformFormMember(this.constructor.name).markAsDirty();

    }

    addSampleType(){
        if(this.expPlatformNode){
            let newSampleType = {
                isSelected:'N',
                idSampleType:'SampleType',
                display:'enter sample type here...',
                codeNucleotideType: 'DNA',
                sortOrder: '99',
                notes:'',
                idCoreFacility: this.expPlatformNode.idCoreFacility
            };
            this.sampleTypeRowData.splice(0,0,newSampleType);
            this.gridApi.setRowData(this.sampleTypeRowData);
            this.expPlatfromService.findExpPlatformFormMember(this.constructor.name).markAsDirty();

        }

    }

    removeSampleType(){
        let removeIndex = this.sampleTypeRowData.indexOf(this.selectedSampleTypeRows[0]);
        if(removeIndex > -1){
            this.sampleTypeRowData.splice(removeIndex,1);
            this.gridApi.setRowData(this.sampleTypeRowData);
            this.expPlatfromService.findExpPlatformFormMember(this.constructor.name).markAsDirty();
        }

    }


    openSampleTypeEditor(){
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            rowData: this.selectedSampleTypeRows.length > 0 ? this.selectedSampleTypeRows[0] : null,
            applyFn: this.applySampleTypeNotesFn
        };
        config.width = '60em';
        config.panelClass = "no-padding-dialog";
        this.sampleTypeDialogRef = this.dialog.open(SampleTypeDetailDialogComponent,config);

        console.log("Launching a the Sample type Editor");


    }

    onSampleTypeRowSelected(event:any){
        if(event.node.selected){
            this.currentSelectedIndex = event.rowIndex;
        }
        this.selectedSampleTypeRows = this.gridApi.getSelectedRows();
    }
    onGridSizeChanged(event){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }
    onCellValueChanged(event):void {
            if(event.oldValue !== event.newValue){
                this.formGroup.markAsDirty();
            }

    }

    externallyResizeGrid(){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }


}
