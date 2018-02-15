
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {Subscription} from "rxjs/Subscription";
import {GnomexStyledGridComponent} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {GridOptions} from "ag-grid/main";
import {URLSearchParams} from "@angular/http"
import {AnalysisService} from "../../services/analysis.service";
import {GnomexStringUtilService} from "../../services/gnomex-string-util.service";


@Component({

    template: `
        <div style="display:block; height:100%; width:100%;">

            <ag-grid-angular style="width: 100%; height: 90%;" class="ag-fresh"
                             [gridOptions]="gridOpt"
                             [rowData]="rowData"
                             [columnDefs]="columnDefs"
                             [rowSelection]="rowSelection"
                             (gridReady)="onGridReady($event)"
                             (cellEditingStarted)="startEditingCell($event)"
                             [enableSorting]="true"
                             [enableColResize]="true">
            </ag-grid-angular>

            <div class="flex-container">
                <span></span>
                <div>
                    <div *ngIf="dirty" style="display:inline; background:#feec89; padding: 1em 1em 1em 1em;">
                        Your changes have not been saved
                    </div>
                    <div style="margin-left:1em;display:inline; ">
                        <button  mat-button  color="primary" (click)="save()"> <img src="../../../assets/action_save.gif">Save</button>
                    </div>
                </div>
            </div>
            
        </div>
        <!--<div> {{experimentService.experimentList[0] | json}} </div> -->

        
        
        
    `,
    styles: [`
       
        
        
        .flex-container{
           
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            padding-left: 1em;
        }
    `]
})
export class AnalysisVisibleTabComponent extends PrimaryTab implements OnInit{

    name = "Visibility";
    //@ViewChild(GnomexStyledGridComponent) myGrid: GnomexStyledGridComponent;
    private filteredExperimentOverviewListSubscript: Subscription;
    private selectedTreeNodeSubscript: Subscription;
    private visList:Array<any>;
    private instList:Array<any>;
    private dirty: boolean = false;
    private gridOpt:GridOptions = {};
    public rowSelection:string = "single";



    /*setState(){
        setTimeout(()=>{
            this.gridOpt.api.sizeColumnsToFit();
        });
    }*/

    private  displayModelFormatter = (params)=>  {
        //console.log(params.column);

        if(params.value){
            let display =  (<string>params.value).split(',');
            return display[0];
        }
        return '';
    };


    private valueChanging = (params):boolean => {
        let eList = this.analysisService.analysisList;
        let rowData = params.data;
        let field = params.colDef.field;


        if(params.newValue !== params.oldValue){
            if(rowData.canUpdateVisibility === 'Y'
                || this.secAdvisor.hasPermission(CreateSecurityAdvisorService.CAN_ACCESS_ANY_OBJECT)){
                rowData.isDirty='Y';
                this.dirty = true;
                rowData[field] = params.newValue;
                return true;
            }else{
                this.dialogService.confirm("Visibility can only be changed by owner, lab manager, or GNomEx admins.",null)
                rowData[field] = params.oldValue;
            }
        }
        return false;
    };





    columnDefs = [
        {
            headerName: "#",
            editable: false,
            field: "number",
            width: 100,
            cellRendererFramework: IconTextRendererComponent

        },
        {
            headerName: "Name",
            field: "name",
            editable: false,
            width: 100
        },
        {
            headerName: "Date",
            field: "createDateDisplay",
            //cellEditorFramework: NumericEditorComponent,
            editable: false,
            width: 200
        },
        {

            headerName: "Analysis Type",
            field: "analysisType",
            //cellEditorFramework: NumericEditorComponent,
            editable: false,
            width: 150
        },
        {
            headerName:  "Organism",
            field: "organism",
            editable: false,
            width: 175
        },
        {
            headerName:  "Description",
            field: "description",
            editable: false,
            width: 400
        },
        {
            headerName:  "Visibility",
            field: "visStr",
            editable: true,
            width: 150,
            cellEditor: 'select',
            cellEditorParams: {
                values: this.prepVisList()
            },
            valueFormatter: this.displayModelFormatter,
            valueSetter: this.valueChanging
        },
        {
            headerName:  "Insitution",
            field: "instStr",
            editable: true,
            width: 315,
            cellEditor: 'select',
            cellEditorParams: {
                values: this.prepInstitutionList()
            },
            valueFormatter: this.displayModelFormatter,
            valueSetter: this.valueChanging
        }




    ];

    rowData:Array<any> =[];





    onGridReady(params) {
    }



    constructor(protected fb: FormBuilder, private analysisService:AnalysisService,
                private dictionaryService:DictionaryService,private secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService, private route:ActivatedRoute,) {
        super(fb);
    }

    ngOnInit(){

        //this.myGrid.setColumns(this.columns);
        //this.myGrid.setDataAdapterSource(this.source);

        this.visList = this.dictionaryService.getEntries(DictionaryService.VISIBILTY);
        this.instList = this.dictionaryService.getEntries(DictionaryService.INSTITUTION);

        this.filteredExperimentOverviewListSubscript = this.analysisService.getFilteredOverviewListObservable()
            .subscribe( data =>{
                this.rowData = data;
            });
        this.selectedTreeNodeSubscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data => {
                this.analysisService.analysisList.forEach(aObj => {
                    this.setVisibility(aObj);
                    this.setInstitution(aObj);

                    let analysisTypeList = this.dictionaryService.getEntries(DictionaryService.ANALYSIS_TYPE);
                    aObj["analysisType"]= this.findFromId(analysisTypeList,aObj["idAnalysisType"]);

                    let organismList = this.dictionaryService.getEntries(DictionaryService.ORGANISM);
                    aObj["organism"] = this.findFromId(organismList,aObj["idOrganism"]);

                });
                this.rowData = this.analysisService.analysisList;
            });

    }



    setVisibility(reqObj: any): void{

        let visObj = this.visList.find(vis => vis.value === reqObj.codeVisibility);
        let visStr:string = visObj.display + ',' + reqObj.codeVisibility;
        reqObj["visStr"] = visStr;


    }
    setInstitution(reqObj: any):void{
        let instObj = this.instList.find(inst => inst.value === reqObj.idInstitution);
        let instStr:string = instObj.display + ',' + reqObj.idInstitution;
        reqObj["instStr"] = instStr;

    }

    startEditingCell(event:any){
        //console.log(event)
    }


    save():void{
        this.dirty = false;
        let aList:Array<any> = this.analysisService.analysisList;

        let dirtyRequests =aList.filter(reqObj => reqObj.isDirty === 'Y');

        if(!dirtyRequests || dirtyRequests.length  === 0){
            return;
        }

        for(let dr of dirtyRequests){
            dr.codeVisibility =  dr.visStr.split(",")[1];
            dr.idInstitution = dr.instStr.split(",")[1];
        }


        for(let i = 0; i < aList.length; i++){
            if(aList[i].codeVisibility === "INST" && aList[i].idInstitution === ''){
                this.dialogService.confirm("Please specify an Institution for requests whose visibility is set to 'Institution'.", null);
                return;
            }
        }



        let params: URLSearchParams = new URLSearchParams();
        let strBody:string = JSON.stringify(dirtyRequests);
        params.set("visibilityXMLString", strBody );


        this.analysisService.saveVisibility(params)
            .subscribe(resp =>{
                this.analysisService.getAnalysisGroupList_fromBackend(this.analysisService.analysisPanelParams,true);
            });
    }

    prepVisList():Array<string>{

        if(!this.visList){
            this.visList= this.dictionaryService.getEntries(DictionaryService.VISIBILTY);
        }
        let visDisplays = [];
        if(this.visList){
            for(let vObj of this.visList){
                visDisplays.push(vObj.display +  "," + vObj.value );
            }
            return visDisplays;
        }
        return visDisplays;

    }
    prepInstitutionList():Array<string>{

        if(!this.instList){ // for first time you need to set it, this code runs before ngOinit
            this.instList = this.dictionaryService.getEntries(DictionaryService.INSTITUTION);
        }
        let instDisplays = [];

        if(this.instList) {
            for(let iObj of this.instList){
                instDisplays.push(iObj.display + ","  + iObj.value );
            }
            return instDisplays;
        }
        return instDisplays

    }

    findFromId(nameList:Array<any>, id:string):string{
        let nameObj = nameList.find(name => {
            return name["value"] === id
        });
        return nameObj["display"];
    }


    ngOnDestroy():void{
        this.filteredExperimentOverviewListSubscript.unsubscribe();
        this.selectedTreeNodeSubscript.unsubscribe();
    }

}




