import {Component, OnInit, ViewChild} from "@angular/core";

import {DictionaryService} from "../services/dictionary.service";

import {TreeComponent, ITreeOptions, TreeModel} from "angular-tree-component";
import {GridOptions} from "ag-grid/main";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ConfigurationService} from "../services/configuration.service";
import {ConstantsService} from "../services/constants.service";
//assets/page_add.png

@Component({
    template: `        
        <div style="display:flex; flex-direction: column; height:100%; width:100%;">
            <div *ngIf="secAdvisor.isSuperAdmin" style="margin-bottom: 0.5em">
                <button mat-button color="primary" type="button" (click)="addCore($event)">
                    <img [src]="constService.PAGE_ADD">Add Core Facility
                </button>
            </div>
            <div style="display:flex;height:100%; width:100%;">
                <split direction="horizontal" (dragEnd)="onSplitDragEnd($event)">
                    <split-area size="20">
                        <div style="height:100%;width:100%;">
                            <ag-grid-angular style="width: 100%; height: 90%;" class="ag-fresh"
                                             [gridOptions]="gridOpt"
                                             [rowData]="rowData"
                                             [columnDefs]="columnDefs"
                                             [rowSelection]="rowSelection"
                                             (gridReady)="onGridReady($event)"
                                             (rowSelected)="selectedRow($event)"
                                             [enableSorting]="true"
                                             [enableColResize]="true" >
                            </ag-grid-angular>

                        </div>
                    </split-area>

                    <split-area size="80">

                        <div style="padding-left:2em;">
                            <core-facility-edit (refreshedCore)="refresh($event)"></core-facility-edit>
                        </div>

                    </split-area>
                </split>

            </div>
            
        </div>
        
        `,
    styles:[`
        .active-item {
            /*color: #636c72;*/
            background-color: #c8c8c8;
        }

        .active-item:hover {
            border: .05rem solid #bfc4c4;
            background-color: #c8c8c8;
            cursor: pointer;
        }
    `]
})

export class ConfigCoreFacilityComponent implements OnInit{

    public readonly rowSelection = "single";
    private rowData = [];
    private currentRow:number=0;
    private gridOpt:GridOptions = {};
    private selectRowIndex:number;

    columnDefs = [
        {
            headerName: "Cores",
            editable: false,
            field: "facilityName",
            width: 100
        }

    ];


    constructor(private secAdvisor:CreateSecurityAdvisorService,
                private configService:ConfigurationService,
                private constService:ConstantsService){
    }

    ngOnInit():void{
        this.rowData = this.secAdvisor.coreFacilitiesICanManage;

    }
    onGridReady(event){
        this.gridOpt.api.sizeColumnsToFit();
        let start:number = 0;
        this.gridOpt.api.forEachNode(node=> {
            return node.rowIndex === start  ? node.setSelected(true) : -1;
        })
    }
    selectedRow(event:any){
        let selectedRow:Array<any> = this.gridOpt.api.getSelectedRows();
        let coreFacility = selectedRow[0];

        if(event.node.selected){
            this.selectRowIndex = event.rowIndex;
            console.log(this.selectRowIndex);
        }



        if(coreFacility){
            this.configService.emitCoreList(coreFacility); // existing core
        }

    }
    addCore(event:any){
        let tempCFacilitiesICanManage:any[] =  this.secAdvisor.coreFacilitiesICanManage;
        tempCFacilitiesICanManage.push({facilityName:''});
        this.rowData = tempCFacilitiesICanManage.slice();

        let end:number = this.rowData.length - 1;

        // need to use setTimeout since just setting rowData doesn't update immediately
        setTimeout(() =>{
            this.gridOpt.api.forEachNode(node=> {
                this.currentRow = node.rowIndex === end ? node.rowIndex : -1;
                return node.rowIndex === end  ? node.setSelected(true) : -1;
            })

        })

    }
    onSplitDragEnd(event:any){
        this.gridOpt.api.sizeColumnsToFit();
    }


    refresh(event:any){
        //this.rowData.find()
        let tempRowData:Array<any> = [];
        let rowItem: any = this.rowData[this.selectRowIndex];
        rowItem.idCoreFacility =event.idCoreFacility;
        rowItem.facilityName = event.facilityName;

        this.rowData = this.rowData.slice();

    }



}
