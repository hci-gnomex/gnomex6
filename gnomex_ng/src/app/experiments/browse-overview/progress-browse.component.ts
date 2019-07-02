
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentsService} from "../experiments.service";
import * as _ from "lodash";
import {DictionaryService} from "../../services/dictionary.service";
import {jqxTreeGridComponent} from "../../../assets/jqwidgets-ts/angular_jqxtreegrid";
import {ConstantsService} from "../../services/constants.service";
import {Subscription} from "rxjs";
import {GridApi, GridReadyEvent} from "ag-grid-community";
import {IconRendererComponent} from "../../util/grid-renderers";


@Component({
    selector: "progress-tab",
    template: `
        <div class="full-width full-height">
            <div class="full-width full-height flex-container-col">
                <div class="full-width">
                    <div class="full-width flex-container-row">
                        <mat-radio-group  [(ngModel)]="selectedOpt" (change)="selectSubFilter()" >
                            <mat-radio-button style="margin: 0.5em"  *ngFor="let opt of progressOptions; let i=index" [value]="opt.label">
                                {{opt.label}}
                            </mat-radio-button>
                        </mat-radio-group>
                        
                    </div>
                </div>
                <div class="flex-container-col full-width flex-grow">
                    <div  class="flex-container-col flex-grow full-width">
                        <ag-grid-angular class="ag-theme-balham full-height full-width"
                                         (gridReady)="this.onGridReady($event)"
                                         [rowDeselection]="true"
                                         [groupDefaultExpanded]="true"
                                         [getNodeChildDetails]="this.getNodeChildDetails"
                                         [enableColResize]="true">
                        </ag-grid-angular>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles:[`


        input[type="radio"] + label:hover {
            /* hide the inputs */
            text-decoration: underline;
        }

        input[type="radio"]:checked + label {
            color: #0f24e6;
        }

        input[type="radio"] {
            /* hide the inputs */
            opacity: 0;
        }

        span.radioLikeLink:hover {
            cursor:hand;
        }

        div.divider {
            display: inline;
            border-left: 1px solid lightgrey;
            height: 2rem;
            margin-left: 1rem;
            padding-left: 1rem;
        }

    `]

})
export class ProgressBrowseTab extends PrimaryTab implements OnInit, OnDestroy{
    name = "Progress";

    private solexaSubscription: Subscription;
    private dnaSeqSubscription: Subscription;
    private microArraySubscription: Subscription;
    private rpSolexaList: Array<any>=[];
    private rpDNASeqList:Array<any>=[];
    private rpList:Array<any> =[];
    private progressOptions = [];
    public gridApi: GridApi;
    public readonly MICRO = "Microarray, Sample Quality";
    public readonly IllUMINA = "Illumina";
    public readonly DNASEQ = "DNA Sequencing Core Facility";
    private selectedOpt: string = "Microarray, Sample Quality";
    private getNodeChildDetails:any;
    private progressRowData:any[];




    private dnaSeqColumns: any[] = [
        { headerName: "#", field: "requestNumber", 	width: 160, cellRenderer:"agGroupCellRenderer",
            cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true},
            rowDrag: false
        },
        { headerName: "Date", field: "createDate", width: 100 },
        { headerName: "Request Type", field:"experimentKind", width: 150 },
        { headerName: "Requester",   field: "appUserName", width: 200 },
        { headerName: "Source Plate", field:"plateName",  width: 150 },
        { headerName: "Sample", field: "sampleName",    width: 200 },
        { headerName: "Sample #", field:"sampleNumber", width: 150 },
        { headerName: "Source Well", field:"sourceWell", width: 150 },
        { headerName: "Assay", field:"assay", width: 150 },
        { headerName: "Status", field:"status",width: 150 }
    ];



    private microColumns: any[] = [
        { headerName: "#", field: "requestNumber", 	width: 160, cellRenderer:"agGroupCellRenderer",
            cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true},
            rowDrag: false
        },
        { headerName: "Date",      field: "createDate", 	width: 150 },
        { headerName: "Request Kind", field:"experimentKind", width:200 },
        { headerName: "Requester", field:"appUserName", width: 200 },
        { headerName: "Hyb #",   field: "hybNumber", width: 150 },
        { headerName: "Cy3 Sample", field:"nameSample1",  width: 150 },
        { headerName: "QC", field: "qcDate1Checked",    width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true} },
        { headerName: "Label",field: "labelDate1Checked", 	  width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true} },
        { headerName: "Cy5 Sample",   field: "nameSample2", width: 150 },
        { headerName: "QC",   field: "qcDate2Checked", width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true} },
        { headerName: "Label",   field: "labelDate2Checked", width: 200, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true} },
        { headerName: "Hyb",   field: "hybDateChecked", width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true}},
        { headerName: "Extract", field: "extractionDateChecked", width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true} },
    ];


    private illuminaColumns: any[] = [
        {headerName: "#", field: "requestNumber", 	width: 160, cellRenderer:"agGroupCellRenderer",
            cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true},
            rowDrag: false
        },
        { headerName: "Date",      field: "createDate", 	width: 150},
        { headerName: "Requester", field:"idAppUser", width: 200},
        { headerName: "Sample #",   field: "sampleNumber", width: 150 },
        { headerName: "Sample Name", field:"sampleName",  width: 200 },
        { headerName: "QC", field: "qcChecked",    width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true}},
        { headerName: "Prep",field: "prepChecked", 	  width: 150, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true}},
        { headerName: "# Lanes",   field: "numberLanes", width: 75},
        { headerName: "Seq",   field: "seqChecked", width: 100, cellRendererFramework: IconRendererComponent, cellRendererParams:{noIconDefault: true}},
        { headerName: "Seq Status",   field: "seqStatus", width: 100 },
    ];
    private columns: any[] = [
    ];

    constructor(protected fb: FormBuilder,private experimentService:ExperimentsService,
                private dictionary:DictionaryService, private constService: ConstantsService) {
        super(fb);
    }


    ngOnInit(){

        this.getNodeChildDetails = function getItemNodeChildDetails(rowItem) {
            let children: any[] = rowItem.children ? rowItem.children : [];

            if (children.length > 0) {

                return {
                    group: true,
                    expanded: true,
                    children: children,
                    key: rowItem.expID
                };
            } else {
                return null;
            }
        };

        this.progressOptions =[
            {id:0, label:"Microarray, Sample Quality"},
            {id:1, label:"Illumina"},
            {id:2, label:"DNA Sequencing Core Facility"}

        ];


    }

    public onGridReady(event: GridReadyEvent): void {
        event.api.sizeColumnsToFit();
        this.gridApi = event.api;
        this.columns = this.microColumns;

        this.microArraySubscription = this.experimentService.getRequestProgressListObservable()
            .subscribe(data =>{
                this.rpList = data;
                if(this.selectedOpt == this.MICRO) {
                    this.selectSubFilter();
                }
            });
        this.dnaSeqSubscription =this.experimentService.getRequestProgressDNASeqListObservable()
            .subscribe((data)=>{
                this.rpDNASeqList = data;
                if(this.selectedOpt == this.DNASEQ) {
                    this.selectSubFilter();
                }
            });
        this.solexaSubscription= this.experimentService.getRequestProgressSolexaListObservable()
            .subscribe(data =>{
                this.rpSolexaList = data;
                if(this.selectedOpt == this.IllUMINA) {
                    this.selectSubFilter();
                }
            });

    }


    initCoreData(reqObject: any):void{
        if(this.selectedOpt === this.MICRO ){
            reqObject["qcDate1Checked"] = reqObject["qualDateSample1"] !== ''? this.constService.ICON_CHECKED: '';
            reqObject["labelDate1Checked"] = reqObject["labelingDateSample1"] !== ''? this.constService.ICON_CHECKED: '';
            reqObject["qcDate2Checked"] = reqObject["qualDateSample2"] !== ''? this.constService.ICON_CHECKED: '';
            reqObject["labelDate2Checked"] = reqObject["labelingDateSample2"] !== ''? this.constService.ICON_CHECKED: '';
            reqObject["hybDateChecked"] = reqObject["hybDate"] !== ''? this.constService.ICON_CHECKED: '';
            reqObject["extractionDateChecked"] = reqObject["extractionDate"] !== ''? this.constService.ICON_CHECKED: '';

        }else if(this.selectedOpt === this.IllUMINA){

            reqObject["qcChecked"] = reqObject["qualDate"] !== ''? this.constService.ICON_CHECKED : '';
            reqObject["prepChecked"] = reqObject["seqPrepDate"] !== ''? this.constService.ICON_CHECKED : '';
            reqObject["seqChecked"] = reqObject["numberLanesSequenced"] > 0 &&
                                      reqObject["numberLanes"] === reqObject["numberLanesSequenced"]?
                                      this.constService.ICON_CHECKED : '';
        }

    }


    selectSubFilter():void{
        let currentParent:string ='';
        let currentParentID = -1;
        let len:number = 0;
        let progressList:Array<any> = [];



        if(this.selectedOpt === this.MICRO ){
            progressList = this.rpList;
            this.columns = this.microColumns;

        }else if(this.selectedOpt === this.IllUMINA){
            progressList = this.rpSolexaList;
            this.columns = this.illuminaColumns;

        }else if(this.selectedOpt === this.DNASEQ){
            progressList = this.rpDNASeqList;
            this.columns = this.dnaSeqColumns;
        }
        this.gridApi.setColumnDefs(this.columns);

        //let start= new Date().getTime();
        this.progressRowData = [];
        if(progressList){
            for(let i = 0; i < progressList.length; i++){

                let rObject = progressList[i];
                let reqCategory = rObject["codeRequestCategory"];
                let eKind:string = this.getExperimentKind(reqCategory);
                rObject["experimentKind"] = eKind;
                rObject["expID"] = i;
                this.initCoreData(rObject);

                if(rObject["showRequestNumber"] === 'Y'){
                    currentParent = rObject["requestNumber"];
                    currentParentID = rObject["expID"];
                    rObject["children"] = [];
                    rObject["parentID"] = null; // jqwidgets had this for parents
                    this.progressRowData.push(rObject)
                }
                else if(rObject["requestNumber"] === currentParent){
                    let currentParentObj:any =  progressList[currentParentID];
                    if(currentParentObj.children){
                        (<any[]>currentParentObj.children).push(rObject)
                    }

                    rObject["parentID"] = currentParentID;
                }

            }
            this.updateGridData(this.progressRowData);
        }else{
            this.updateGridData([]);
        }
        this.gridApi.sizeColumnsToFit();

    }
    updateGridData(data:Array<any>):void{
        if(this.gridApi){
            this.gridApi.setRowData(Array.isArray(data) ? data :[data])
        }

    }

    getExperimentKind(requestCategory:string):string{
        let de = this.dictionary.getEntry(DictionaryService.REQUEST_CATEGORY, requestCategory);
        if(de){
            return de.display;
        }
        else{
            return "";
        }

    }



    ngOnDestroy():void{
        this.solexaSubscription.unsubscribe();
        this.dnaSeqSubscription.unsubscribe();
        this.microArraySubscription.unsubscribe();

    }

}

function getDownloadGroupRenderer() {
    function DownloadGroupRenderer() {
    }

    DownloadGroupRenderer.prototype.init = function(params) {
        let tempDiv = document.createElement("div");
        if ( params.data.showRequestNumber == 'Y') {
                tempDiv.innerHTML = '<span><img src="' + params.data.icon + '" class="icon"/>' + params.value + '</span>';

        } else {
            tempDiv.innerHTML = '<span >' + '' + '</span>';
        }
        this.eGui = tempDiv.firstChild;
    };

    DownloadGroupRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return DownloadGroupRenderer;
}
