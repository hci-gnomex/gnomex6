import {AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";


import {TreeComponent, ITreeOptions, TreeModel} from "angular-tree-component";
import {GridOptions} from "ag-grid/main";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ConfigurationService} from "../../services/configuration.service";
import {ConstantsService} from "../../services/constants.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {EpLibraryPrepTabComponent} from "./ep-library-prep-tab.component";
import {EpPropertyTabComponent} from "./ep-property-tab.component";
import {Subscription} from "rxjs";
import {DialogsService} from "../../util/popup/dialogs.service";
//assets/page_add.png

@Component({
    templateUrl: './experiment-platform-overview.component.html',
    styles:[`
        .active-item {
            /*color: #636c72;*/
            background-color: #c8c8c8;
        }

        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }

        .active-item:hover {
            border: .05rem solid #bfc4c4;
            background-color: #c8c8c8;
            cursor: pointer;
        }
    `]
})

export class ExperimentPlatformOverviewComponent implements OnInit, OnDestroy{

    public readonly rowSelection = "single";
    private rowData = [];
    private currentRow:number=0;
    private gridOpt:GridOptions = {};
    private selectRowIndex:number = -1 ;
    public experimentPlatformTabs: any[] = [];
    public platformListSubscription: Subscription;



    columnDefs = [
        {
            headerName: "Experiment Platform",
            editable: false,
            field: "display",
            width: 100
        }

    ];

    public readonly tabComponentTemplate:any = {
        'ExperimentPlatformTabComponent': {name: 'Experiment Platform', component: ExperimentPlatformTabComponent},
        'EpSampleTypeTabComponent': {name: 'Sample Type', component: EpSampleTypeTabComponent },
        'EpLibraryPrepTabComponent': {name:'LibraryPrep', component: EpLibraryPrepTabComponent},
        'EpPropertyTabComponent': {name:'Property', component: EpPropertyTabComponent}

    };







    constructor(private secAdvisor:CreateSecurityAdvisorService,
                private constService:ConstantsService,
                public expPlatformService: ExperimentPlatformService,
                private dialogService:DialogsService){
    }

    ngOnInit():void{
        this.expPlatformService.getExperimentPlatformList_fromBackend(); // need

        this.platformListSubscription = this.expPlatformService.getExperimentPlatformListObservable()
            .subscribe(resp =>{
            if(resp){
                this.rowData = (<Array<any>>resp).filter(exPlatform => exPlatform.isActive === 'Y' );
            }else if(resp && resp.message){
                this.dialogService.alert(resp.message);
            }else{
                this.dialogService.alert("An error has occurred getting ExperimentPlatformList");
            }
        });

        this.expPlatformService.getExperimentPlatformTypeChangeObservable()
            .subscribe((expPlatform) =>{
                this.expPlatformService.setExperimentPlatformState(expPlatform);
                this.propagateTabChange();
            });

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
        let exPlatform = selectedRow[0];

        if( this.selectRowIndex != event.rowIndex){
            console.log("Previous tab: " + this.selectRowIndex + " current Tab: " + event.rowIndex  );
            this.selectRowIndex = event.rowIndex;
        }

        /*if(event.node.selected){
            this.selectRowIndex = event.rowIndex;
            console.log(this.selectRowIndex);
        }*/


        if(exPlatform && event.node.selected){


            this.expPlatformService.setExperimentPlatformState(exPlatform);
            this.expPlatformService.emitExperimentPlatform(exPlatform); // existing platform
            this.propagateTabChange();

            //this.experimentPlatformTabs =
        }


    }
    addCore(event:any){
        let tempCFacilitiesICanManage:any[] =  this.secAdvisor.coreFacilitiesICanManage;
        tempCFacilitiesICanManage.push({facilityName:''});
        this.gridOpt.api.setRowData(this.rowData);

        let end:number = this.rowData.length - 1;

        // need to use setTimeout since just setting rowData doesn't update immediately

        this.gridOpt.api.forEachNode(node=> {
            this.currentRow = node.rowIndex === end ? node.rowIndex : -1;
            return node.rowIndex === end  ? node.setSelected(true) : -1;

        })

    }

    propagateTabChange(){
        let tabList:any[] =[];
        this.expPlatformService.getExperimentPlatformTabList().forEach(tabStr =>{
            tabList.push(this.tabComponentTemplate[tabStr]);
        });
        this.experimentPlatformTabs = tabList;
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


    onCreate(event:any){

    }

    ngOnDestroy(){
        this.platformListSubscription.unsubscribe();
    }



}
