
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentsService} from "../experiments.service";
import * as _ from "lodash";
import {DictionaryService} from "../../services/dictionary.service";
import {jqxTreeGridComponent} from "../../../assets/jqwidgets-ts/angular_jqxtreegrid";
import {ConstantsService} from "../../services/constants.service";
import {Subscription} from "rxjs/Subscription";


@Component({
    template: `
        <div style="display:block; height:100%; width:100%;">
            <span class="radioLikeLink" *ngFor="let opt of progressOptions; let i=index">
                <input id="{{opt.id}}" type="radio" name="progressRadio" [(ngModel)]="selectedOpt"  [id]="opt.id" [value]="opt.label" (change)="selectSubFilter()">
                <label for="{{opt.id}}">{{opt.label}}</label>
                <div *ngIf="!isEnd(i)" class="divider"></div>
                
            </span>
            
            
            <div #treeGridContainer style="display:block; height:100%; width:100%;">
                <jqxTreeGrid
                        
                        [width]="'calc(100% - 2px)'"
                        [source]="dataAdapter"
                        [pageable]="true"
                        [sortable]="true"
                        [columns]="columns"
                        [columnsResize]="true"
                        #TreeGrid
                >
                    <!-- [width]="'calc(100% - 2px)'"-->
                </jqxTreeGrid>
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
    public readonly MICRO = "Microarray, Sample Quality";
    public readonly IllUMINA = "Illumina";
    public readonly DNASEQ = "DNA Sequencing Core Facility";
    private selectedOpt: string = "Microarray, Sample Quality";

    @ViewChild('TreeGrid') myGrid: jqxTreeGridComponent;
    @ViewChild('treeGridContainer') container: ElementRef;



    private iconCellRenderer = (row: number, column: any, imgSource: any) =>{

        return `<div style="display: block; text-align: left; padding:0.3rem 0.5rem;">
							<img src="` + imgSource +`" alt=""/>` +
            `</div>`;
    };

    private experimentNumberCellsRenderer = (row: number, column: any, value: any): any => {

        if(row < this.source.localdata.length ){
            let imgSource = this.source.localdata[row].icon;
            if(this.source.localdata[row].showRequestNumber == 'Y'){
                return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">
							<img src="` + imgSource +`" alt=""/>` + value +
                    `</div>`;
            }else{
                return `<div style="display: block;"></div> `
            }
        }
        return `<div style="display: block;"></div> `

    };


    private textCellsRenderer = (row: number, column: any, value: any): any => {
        let htmlStr:string = `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;" >`
                               + value +  `</div>`;
        return htmlStr;
    };


    private dnaSeqColumns: any[] = [
        {text: "#", datafield: "requestNumber", 	width: "8%", cellsrenderer: this.experimentNumberCellsRenderer },
        {text: "Date", datafield: "createDate", 	width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Request Type", datafield:"experimentKind", width: "10%", cellsrenderer: this.textCellsRenderer},
        {text: "Requester",   datafield: "appUserName", width: "10%", cellsrenderer: this.textCellsRenderer},
        {text: "Source Plate", datafield:"plateName",  width: "14%", cellsrenderer: this.textCellsRenderer},
        {text: "Sample", datafield: "sampleName",    width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Sample #", datafield:"sampleNumber", width:"7%", cellsrenderer: this.textCellsRenderer },
        {text: "Source Well", datafield:"sourceWell", width:"7%", cellsrenderer: this.textCellsRenderer },
        {text: "Assay", datafield:"assay", width:"10%", cellsrenderer: this.textCellsRenderer },
        {text: "Status", datafield:"status",width:"20%", cellsrenderer: this.textCellsRenderer }
    ];



    private dnaSeqSource = {
        datatype: "json",
        localdata: [],
        datafields: [
            {name:"expID", type:"number"},
            {name:"parentID", type:"number"},
            {name: "requestNumber", type: "string"},
            {name: "createDate", type: "string"},
            {name: "experimentKind", type:"string"},
            {name: "appUserName", type: "string"},
            {name: "plateName", type: "string"},
            {name: "sampleName", type:"string"},
            {name: "sampleNumber", type: "string"},
            {name: "sourceWell", type: "string"},
            {name: "assay", type: "string"},
            {name: "status", type:"string"}
        ],
        hierarchy:{
            keyDataField:{ name: 'expID'},
            parentDataField: { name: 'parentID'}
        },
        id: 'expID'
    };

    private microColumns: any[] = [
        {text: "# ",        datafield: "requestNumber", 	width: "8%", cellsrenderer: this.experimentNumberCellsRenderer },
        {text: "Date",      datafield: "createDate", 	width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Request Kind", datafield:"experimentKind", width:"12%", cellsrenderer:this.textCellsRenderer},
        {text: "Requester", datafield:"appUserName", width: "12%", cellsrenderer: this.textCellsRenderer},
        {text: "Hyb #",   datafield: "hybNumber", width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Cy3 Sample", datafield:"nameSample1",  width: "15%", cellsrenderer: this.textCellsRenderer},
        {text: "QC", datafield: "qcDate1Checked",    width: "4%", cellsrenderer: this.iconCellRenderer},
        {text: "Label",datafield: "labelDate1Checked", 	  width: "4%", cellsrenderer: this.iconCellRenderer},
        {text: "Cy5 Sample",   datafield: "nameSample2", width: "9%", cellsrenderer: this.textCellsRenderer},
        {text: "QC",   datafield: "qcDate2Checked", width: "4%", cellsrenderer: this.iconCellRenderer},
        {text: "Label",   datafield: "labelDate2Checked", width: "4%", cellsrenderer: this.iconCellRenderer},
        {text: "Hyb",   datafield: "hybDateChecked", width: "7%", cellsrenderer: this.iconCellRenderer},
        {text: "Extract",   datafield: "extractionDateChecked", width: "7%", cellsrenderer: this.textCellsRenderer},
    ];

    private microSource = {
        datatype: "json",
        localdata: [],
        datafields: [
            {name:"expID", type:"number"},
            {name:"parentID", type:"number"},
            {name: "requestNumber", type: "string"},
            {name: "createDate", type: "string"},
            {name: "experimentKind", type: "string"},
            {name: "appUserName", type: "string"},
            {name: "hybNumber", type: "string"},
            {name: "nameSample1", type: "string"},
            {name: "qcDate1Checked", type: "string"},
            {name: "labelDate1Checked", type: "string"},
            {name: "nameSample2", type: "string"},
            {name: "qcDate2Checked", type: "string"},
            {name: "labelDate2Checked", type: "string"},
            {name: "hybDateChecked", type: "string"},
            {name: "extractionDateChecked", type: "string"},
        ],
        hierarchy:{
            keyDataField:{ name: 'expID'},
            parentDataField: { name: 'parentID'}
        },
        id: 'expID'
    };

    private illuminaColumns: any[] = [
        {text: "# ",        datafield: "requestNumber", 	width: "12%", cellsrenderer: this.experimentNumberCellsRenderer },
        {text: "Date",      datafield: "createDate", 	width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Requester", datafield:"idAppUser", width: "8%", cellsrenderer: this.textCellsRenderer},
        {text: "Sample #",   datafield: "sampleNumber", width: "9%", cellsrenderer: this.textCellsRenderer},
        {text: "Sample Name", datafield:"sampleName",  width: "17%", cellsrenderer: this.textCellsRenderer},
        {text: "QC", datafield: "qcChecked",    width: "7%", cellsrenderer: this.iconCellRenderer},
        {text: "Prep",datafield: "prepChecked", 	  width: "7%", cellsrenderer: this.iconCellRenderer},
        {text: "# Lanes",   datafield: "numberLanes", width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Seq",   datafield: "seqChecked", width: "7%", cellsrenderer: this.iconCellRenderer},
        {text: "Seq Status",   datafield: "seqStatus", width: "20%", cellsrenderer: this.textCellsRenderer},
    ];

    private illuminaSource = {
        datatype: "json",
        localdata: [],
        datafields: [
            {name:"expID", type:"number"},
            {name:"parentID", type:"number"},
            {name: "requestNumber", type: "string"},
            {name: "createDate", type: "string"},
            {name: "idAppUser", type: "string"},
            {name: "sampleNumber", type: "string"},
            {name: "sampleName", type: "string"},
            {name: "qcChecked", type: "string"},
            {name: "prepChecked", type: "string"},
            {name: "numberLanes", type: "string"},
            {name: "seqChecked", type: "string"},
            {name: "seqStatus", type: "string"}
        ],
        hierarchy:{
            keyDataField:{ name: 'expID'},
            parentDataField: { name: 'parentID'}
        },
        id: 'expID'
    };




    private columns: any[] = [
    ];

    private source = {
        localdata: []
    };

    dataAdapter: any = [];

    constructor(protected fb: FormBuilder,private experimentService:ExperimentsService,
                private dictionary:DictionaryService, private constService: ConstantsService) {
        super(fb);
    }


    ngOnInit(){

        this.progressOptions =[
            {id:0, label:"Microarray, Sample Quality"},
            {id:1, label:"Illumina"},
            {id:2, label:"DNA Sequencing Core Facility"}

        ];

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
        this.columns = this.microColumns;
        this.source = this.microSource;
        this.updateGridData(this.rpList);
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
            this.source = this.microSource;
            this.columns = this.microColumns;

        }else if(this.selectedOpt === this.IllUMINA){
            progressList = this.rpSolexaList;
            this.source = this.illuminaSource;
            this.columns = this.illuminaColumns;

        }else if(this.selectedOpt === this.DNASEQ){
            progressList = this.rpDNASeqList;

            this.source = this.dnaSeqSource;
            this.columns = this.dnaSeqColumns;
        }

        //let start= new Date().getTime();
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
                    rObject["parentID"] = null; // jqwidgets had this for parents
                }
                else if(rObject["requestNumber"] === currentParent){
                    rObject["parentID"] = currentParentID;
                }

            }
            this.updateGridData(progressList);
        }else{
            this.updateGridData([]);
        }




        //this.myGrid.expandAll();
    }
    updateGridData(data:Array<any>):void{
        this.source.localdata = Array.isArray(data) ? data :[data];
        this.dataAdapter = new jqx.dataAdapter(this.source);
        //this.myGrid.selectedrowindexes([]);

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

    isEnd(index:number):boolean{
        return (this.progressOptions.length - 1 === index);
    }


    ngOnDestroy():void{
        this.solexaSubscription.unsubscribe();
        this.dnaSeqSubscription.unsubscribe();
        this.microArraySubscription.unsubscribe();

    }

}
