
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
import {LabListService} from "../../services/lab-list.service";
import {CreateAnalysisComponent} from "../create-analysis.component";
import {MatDialogRef, MatDialog} from "@angular/material";
import {DeleteAnalysisComponent} from "../delete-analysis.component";
import {ConstantsService} from "../../services/constants.service";


@Component({

    selector: "analysis-tab",
    template: `
        <div style="display:flex; flex-direction: column; height:100%; width:100%;">
            <div style="flex:1;">
                <button mat-button [disabled]="!enableCreateAnalysis"   (click)="create()"> <img [src]="this.newSegment" > New</button>
                <button mat-button   [disabled]="!enableRemoveAnalysis" (click)="remove()"> <img [src]="this.removeSegment" > Remove</button>
            </div>
            <div style="display:flex; flex:9; width:100%;">
                <ag-grid-angular style="width: 100%;" class="ag-fresh"
                                 [gridOptions]="gridOpt"
                                 (cellDoubleClicked)="forwardToAnalysis($event)"
                                 (rowSelected)="selectedRow($event)"
                                 [rowDeselection]="true"
                                 [rowData]="rowData"
                                 [columnDefs]="columnDefs"
                                 [rowSelection]="rowSelection"
                                 (gridReady)="onGridReady($event)"
                                 (gridSizeChanged)="adjustColumnSize($event)"
                                 (cellEditingStarted)="startEditingCell($event)"
                                 [enableSorting]="true"
                                 [enableColResize]="true">
                </ag-grid-angular>
                
            </div>
            
        </div>
        
    `,
    styles: [`
       
        
        
        .flex-container{
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
        }
    `]
})
export class AnalysisTab extends PrimaryTab implements OnInit{
    //Override
    name = "Analysis";
    private filteredAnalysistOverviewListSubscript: Subscription;
    private selectedTreeNodeSubscript: Subscription;
    private gridOpt:GridOptions = {};
    public rowSelection ="multiple";
    private labList = [];
    private createAnalysisData:any;
    private enableRemoveAnalysis:boolean = false;
    private enableCreateAnalysis:boolean = true;
    private createAnalysisDialogRef: MatDialogRef<CreateAnalysisComponent>;
    private deleteAnalysisDialogRef: MatDialogRef<DeleteAnalysisComponent>;
    public  newSegment:string;
    public  removeSegment:string;



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
            editable: false,
            width: 200
        },
        {

            headerName: "Submitted by",
            field: "ownerName",
            editable: false,
            width: 200
        },
        {

            headerName: "Analysis Type",
            field: "analysisType",
            editable: false,
            width: 200
        },
        {

            headerName: "Analysis Protocol",
            field: "analysisProtocol",
            editable: false,
            width: 200
        },
        {

            headerName: "Organism",
            field: "organism",
            editable: false,
            width: 200
        },
        {

            headerName: "Description",
            field: "stripDescription",
            editable: false,
            width: 400
        },


    ];

    rowData:Array<any> =[];





    onGridReady(params) {
    }



    constructor(protected fb: FormBuilder, private analysisService:AnalysisService,
                private dictionaryService:DictionaryService, private router:Router,
                private StrUtil:GnomexStringUtilService,private labListService:LabListService,
                private dialog: MatDialog,private createSecurityAdvisorService:CreateSecurityAdvisorService,
                private constService:ConstantsService
                ) {
        super(fb);
    }

    ngOnInit(){
        this.newSegment = this.constService.SEGMENGT_NEW;
        this.removeSegment = this.constService.SEGMENGT_REMOVE_DISABLE;

        this.labListService.getLabList().subscribe((response: any[]) => {
            this.labList = response;
        });

        this.analysisService.getCreateAnaylsisDataSubject()
            .subscribe(data =>{
                this.createAnalysisData = data;
            });


        this.filteredAnalysistOverviewListSubscript = this.analysisService.getFilteredOverviewListObservable()
            .subscribe( data =>{
                this.rowData = data;
            });
        this.selectedTreeNodeSubscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data => {
                this.enableRemoveAnalysis = false;
                this.analysisService.analysisList.forEach(aObj => {
                    this.enableCreateAnalysis = true;

                    let analysisTypeList = this.dictionaryService.getEntries(DictionaryService.ANALYSIS_TYPE);
                    aObj["analysisType"]= this.findFromId(analysisTypeList,aObj["idAnalysisType"]);

                    let analysisProtocolList = this.dictionaryService.getEntries(DictionaryService.ANALYSIS_PROTOCOL);
                    aObj["analysisProtocol"] = this.findFromId(analysisProtocolList,aObj["idAnalysisProtocol"]);

                    let organismList = this.dictionaryService.getEntries(DictionaryService.ORGANISM);
                    aObj["organism"] = this.findFromId(organismList,aObj["idOrganism"]);
                    aObj["stripDescription"] = GnomexStringUtilService.stripHTMLText(aObj["description"]);
                });
                this.rowData = this.analysisService.analysisList;
                if (this.createAnalysisDialogRef != undefined && this.createAnalysisDialogRef.componentInstance != undefined) {
                    if (this.createAnalysisDialogRef.componentInstance.showSpinner) {
                        this.createAnalysisDialogRef.componentInstance.showSpinner = false;
                    }
                    this.createAnalysisDialogRef.close();
                }
                if (this.deleteAnalysisDialogRef != undefined && this.deleteAnalysisDialogRef.componentInstance != undefined) {
                    if (this.deleteAnalysisDialogRef.componentInstance.showSpinner) {
                        this.deleteAnalysisDialogRef.componentInstance.showSpinner = false;
                    }
                    this.deleteAnalysisDialogRef.close();
                }


            });

    }




    startEditingCell(event:any){
        //console.log(event)
    }

    adjustColumnSize(event:any){
        if(this.gridOpt.api){
            this.gridOpt.api.sizeColumnsToFit();
        }
    }



    forwardToAnalysis(event:any){
        console.log(event);
        let rowData = event.data;
        let analysisNode = this.analysisService.analysisList
            .find(aObj => aObj.idAnalysis === rowData.idAnalysis);
        this.router.navigate(['/analysis',{outlets:{'analysisPanel':[analysisNode.idAnalysis]}}]);
    }



    findFromId(nameList:Array<any>, id:string):string{
       let nameObj = nameList.find(name => {
            return name["value"] === id
        });
        return nameObj["display"];
    }
    remove():void{

        let selectedAnalysisList:Array<any> = this.gridOpt.api.getSelectedRows();
        if (selectedAnalysisList && selectedAnalysisList.length > 0) {
            this.deleteAnalysisDialogRef = this.dialog.open(DeleteAnalysisComponent, {
                data: {
                    idAnalysisGroup: selectedAnalysisList[0].idAnalysisGroup,
                    nodes: selectedAnalysisList
                }
            });
        }


    }
    create():void{

        let items = [];
        let labs = [];
        let selectedIdLab:string = "";
        let selectedLabLabel:string= "";
        if(this.createAnalysisData){
            items = this.createAnalysisData.items;
            labs = this.createAnalysisData.labs ? this.createAnalysisData.labs : [];
            selectedIdLab = this.analysisService.analysisList[0].idLab;
            selectedLabLabel = this.analysisService.analysisList[0].labName;

        }




        let labListString = this.labList.map(function (item) {
            return item['name'];
        });
        var useThisLabList: any[];
        if (this.createSecurityAdvisorService.isSuperAdmin) {
            useThisLabList = this.labList;
        } else {
            useThisLabList = labs;
        }

        this.createAnalysisDialogRef = this.dialog.open(CreateAnalysisComponent, {
            data: {
                labList: useThisLabList,
                items: items,
                selectedLab: selectedIdLab,
                selectedLabLabel: selectedLabLabel
                //selectedItem: this.selectedItem
            }
        });


    }
    selectedRow(event:any){
        let selectedRows:Array<any> = this.gridOpt.api.getSelectedRows();
        if(selectedRows.length === 0){
            this.enableRemoveAnalysis = false;
            this.removeSegment = this.constService.SEGMENGT_REMOVE_DISABLE;
        }else{
            this.enableRemoveAnalysis = true;
            this.removeSegment = this.constService.SEGMENGT_REMOVE;
        }


    }




    ngOnDestroy():void{
        this.filteredAnalysistOverviewListSubscript.unsubscribe();
        this.selectedTreeNodeSubscript.unsubscribe();
    }

}




