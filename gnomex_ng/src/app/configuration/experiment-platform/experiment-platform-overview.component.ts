import { Component, ComponentRef, OnDestroy, OnInit } from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ConfigurationService} from "../../services/configuration.service";
import {ConstantsService} from "../../services/constants.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {EpLibraryPrepTabComponent} from "./ep-library-prep-tab.component";
import {Subscription} from "rxjs";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import {MatTabChangeEvent} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {IconTextRendererComponent} from "../../util/grid-renderers";
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
    public  selectedPlatformList:any[] = [];
    public experimentPlatformTabs: any[] = [];
    public platformListSubscription: Subscription;
    private tabComponentRefList:ComponentRef<any>[] = [];
    public showSpinner:boolean = true;
    public removeSave:boolean = false;



    columnDefs = [
        {
            headerName: "Experiment Platform",
            editable: false,
            field: "display",
            cellRendererFramework : IconTextRendererComponent,
            width: 100
        }

    ];

    public tabComponentTemplate:any = {
        'ExperimentPlatformTabComponent': {name: 'Experiment Platform', component: ExperimentPlatformTabComponent, inputs: {}},
        'EpSampleTypeTabComponent': {name: 'Sample Type', component: EpSampleTypeTabComponent,inputs:{} },
        'EpLibraryPrepTabComponent': {name:'LibraryPrep', component: EpLibraryPrepTabComponent,inputs:{}},
        'ConfigureAnnotationsComponent': {name:'Property', component: ConfigureAnnotationsComponent, inputs:{experimentPlatformType:'GENERIC',experimentPlatformMode:true }}

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

                this.showSpinner = false;
                this.rowData = (<Array<any>>resp).filter(exPlatform => exPlatform.isActive === 'Y' );
            }else if(resp && resp.message){
                this.dialogService.alert(resp.message);
            }else{
                this.dialogService.alert("An error has occurred getting ExperimentPlatformList");
            }
                this.expPlatformService.expPlatformOverviewForm.markAsPristine();
                this.expPlatformService.expPlatformOverviewForm.markAsUntouched();
        });

        this.expPlatformService.getExperimentPlatformTypeChangeObservable()
            .subscribe((expPlatform) =>{
                this.expPlatformService.setExperimentPlatformState(expPlatform);
                this.propagateTabChange();
                this.componentInit(expPlatform);

            });

    }

    componentCreated(event:ComponentRef<any>){
        this.tabComponentRefList.push(event);
        if(event.instance instanceof ConfigureAnnotationsComponent ){
            let propertyTab:ConfigureAnnotationsComponent = event.instance;
            propertyTab.experimentPlatformMode = true;
        }

        //this.expPlatformService.addExpPlatformFormMember()
    }


    onGridReady(event){
        this.gridOpt.api.sizeColumnsToFit();
        let start:number = 0;
        this.gridOpt.api.forEachNode(node=> {
            return node.rowIndex === start  ? node.setSelected(true) : -1;
        })
    }
    selectedRow(event:any){
        this.selectedPlatformList = this.gridOpt.api.getSelectedRows();
        let exPlatform = null;
        if(this.selectedPlatformList.length > 0){
            exPlatform = this.selectedPlatformList[0];
        }

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

            this.componentInit(exPlatform);


            //this.experimentPlatformTabs =
        }

    }
    addPlatform(event:any){
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
    removePlatform(){
        let expPlatform = this.selectedPlatformList.length > 0 ? this.selectedPlatformList[0] : null;
        if(expPlatform){
            this.dialogService.confirm("Remove Platform ",
                "Are you sure you want to remove experiment platform " + expPlatform.display + "?")
                .first().subscribe((result:boolean) => {
                    if(result){
                        this.showSpinner = true;
                        let params:HttpParams = new HttpParams().set("codeRequestCategory", expPlatform.codeRequestCategory);
                        console.log(params);
                        this.expPlatformService.deleteExperimentPlatform(params).first()
                            .subscribe(resp => {
                                if(resp && resp.result === "SUCCESS"){
                                    this.expPlatformService.getExperimentPlatformList_fromBackend();
                                }else if(resp && resp.message){
                                    this.dialogService.alert(resp.message);
                                }
                            });

                    }
                })
        }


    }


    propagateTabChange() { // programmatically reloading tabs
        let tabList: any[] = [];
        this.expPlatformService.getExperimentPlatformTabList().forEach(tabStr => {
            tabList.push(this.tabComponentTemplate[tabStr]);
        });
        this.experimentPlatformTabs = tabList;
    }

    tabChanged(event:MatTabChangeEvent){ // user selected a new tab
        this.removeSave = false;
        if(event.tab.textLabel  === "Property"){
            let propertyTabRef:ComponentRef<ConfigureAnnotationsComponent> =
                this.tabComponentRefList.find(compRef => compRef.instance instanceof ConfigureAnnotationsComponent );
            propertyTabRef.instance.externallyResizeGrid();
            this.removeSave = true;
        }else if (event.tab.textLabel === "Sample Type"){
            let sampleTypeTabRef:ComponentRef<EpSampleTypeTabComponent> =
                this.tabComponentRefList.find(compRef => compRef.instance instanceof EpSampleTypeTabComponent );
            sampleTypeTabRef.instance.externallyResizeGrid();
        }


    }

    componentInit(expPlatform:any){
        setTimeout(() =>{
            let propertyTab:ComponentRef<ConfigureAnnotationsComponent> = null;
            let tempTabComponentRefList:ComponentRef<any>[] = [];
            for(let i = 0; i< this.tabComponentRefList.length; i++){
                let pt = this.experimentPlatformTabs.find(platTab => this.tabComponentRefList[i].instance instanceof platTab.component)
                if(pt){
                    tempTabComponentRefList.push(this.tabComponentRefList[i]);
                }else{
                    this.expPlatformService.initExpPlatformForm(this.tabComponentRefList[i].instance.constructor.name, true);
                }
            }
            this.tabComponentRefList = tempTabComponentRefList;

            for(let compRef of this.tabComponentRefList){
                let name = compRef.instance.constructor.name;
                if(compRef.instance.formGroup && !this.expPlatformService.findExpPlatformFormMember(name)){
                    this.expPlatformService.addExpPlatformFormMember(compRef.instance.formGroup,name);
                }
                if(compRef.instance instanceof ConfigureAnnotationsComponent ){
                    propertyTab = compRef;
                }
            }
            propertyTab.instance.setupExpPlatformMode(expPlatform);


        });
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
