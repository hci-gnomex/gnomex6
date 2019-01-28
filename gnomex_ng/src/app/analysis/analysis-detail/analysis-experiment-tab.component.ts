
import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output, Input} from "@angular/core";
import {Subscription} from "rxjs";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActivatedRoute} from "@angular/router";
import {GridOptions} from "ag-grid-community/main";
import {GnomexService} from "../../services/gnomex.service";
import {AnalysisService} from "../../services/analysis.service";
import {ITreeOptions} from "angular-tree-component";
import {HttpParams} from "@angular/common/http";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {first} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";


@Component({
    selector: "analysis-experiment-tab",
    templateUrl:"./analysis-experiment-tab.component.html",
    styles: [`

        mat-radio-group.filter {
            display: inline-flex;
            flex-direction: row;
            margin: 1em;
            padding-top: 1em;
        }
        mat-radio-button.filterOption{
            margin: 0 5px
        }
        
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }

        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        
        .br-exp-item {
            flex: 1 1 auto;
            font-size: small;
        }
        

       
        .datatracks-panel {
            height:100%;
            width:100%;
            border: #C8C8C8 solid thin;
            padding: 1em;
        }
        .truncate{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        
    `]
})
export class AnalysisExperimentTabComponent implements OnInit{
    public readonly selectType:string = "mutiple";
    private selectedTreeNodeSubscript: Subscription;
    private gridOpt:GridOptions = {};
    public currentLab:any;
    public showSpinner:boolean = false;
    public labList:any[] = [];
    public analysis:any;
    public analysisTreeNode:any;
    public options:ITreeOptions;
    public items: any[] = [];

    private _seqProtocolDataProvider:any[];
    private _genomeBuildDataProvider:any[];

    public hybsList:any[] = [];
    public lanesList:any[] = [];
    public sampleList:any[] = [];
    public readonly HYBS:string  ="Hybridization";
    public readonly SAMPLE:string = "Sample";
    public readonly SEQ_LANES:string = "SequenceLane";
    public gridRaidoOpt:string = "Hybridization";
    private _tabVisible: boolean = false;
    private formGroup:FormGroup;

    @Input() set tabVisible(val:boolean){
        this._tabVisible = val;
     }
     get tabVisible():boolean{
        return this._tabVisible;
     }



    @Input() edit:boolean = true; // true should not be default when all of analysis detail  tabs are implemented
                                  // this is for demonstration till that is implemented

    get seqProtocolDataProvider():any[]{
        if(!this._seqProtocolDataProvider){
            this._seqProtocolDataProvider=  this.dictionaryService.getEntries(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED);
            return this._seqProtocolDataProvider
        }
        return this._seqProtocolDataProvider;
    }
    get genomeBuildDataProvider():any[] {
        if(!this._genomeBuildDataProvider){
            this._genomeBuildDataProvider = this.dictionaryService.getEntries(DictionaryService.GENOME_BUILD);
            return this._genomeBuildDataProvider;
        }
        return this._genomeBuildDataProvider;
    }

    colDefs:Array<any> =[];


    hybColDefs :any[] =
        [
            {
                headerName: "ID",
                editable: false,
                field: "number",
                width: 200,
            },
            {
                headerName: "Experiment Name",
                editable: false,
                field: "experimentName",
                width: 300,
            },
            {
                headerName: "Cy3 Sample (green)",
                editable: false,
                field: "sampleName1",
                width: 350
            },
            {
                headerName: "ID",
                editable: false,
                field: "sampleNumber1",
                width: 300
            },
            {
                headerName: "Cy5 Sample (red)",
                editable: false,
                field: "sampleName2",
                width: 300
            },
            {
                headerName: "ID",
                editable: false,
                field: "sampleNumber2",
                width: 300
            },
            {
                headerName: "Slide",
                editable: false,
                field: "slideDesignName",
                width: 400
            }
        ];






    seqLaneColDefs:any[] =
        [
            {
                headerName: "ID",
                field: "number",
                editable: false,
                width: 200
            },
            {
                headerName: "Experiment Name",
                field: "experimentName",
                editable: false,
                width: 300
            },
            {

                headerName: "Sample Name",
                field: "sampleName",
                editable: false,
                width: 340
            },
            {
                headerName:  "Sample Number",
                field: "sampleNumber",
                editable: false,
                width: 400
            },
            {
                headerName:  "Seq. Protocol",
                field: "idNumberSequencingCyclesAllowed",
                editable: false,
                cellRendererFramework: SelectRenderer,
                selectOptions: this.seqProtocolDataProvider,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idNumberSequencingCyclesAllowed",
                width: 400
            },
            {
                headerName: "Flow Cell #",
                editable:  false,
                width: 150,
                field: "flowCellNumber"
            },
            {
                headerName: "Channel",
                field: "flowCellChannelNumber",
                editable:  false,
                width: 120,

            },
            {
                headerName: "Genome Build (align to)",
                field: "idGenomeBuildAlignTo",
                editable:  false,
                selectOptions: this.genomeBuildDataProvider,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idGenomeBuildAlignTo",
                width: 300,
            },
            {
                headerName: "Analysis Instructions",
                field: "analysisInstructions",
                editable:  false,
                width: 300

            }

        ];


    sampleColDefs =
        [
            {
                headerName: "ID",
                field: "number",
                editable: false,
                width: 200
            },
            {
                headerName: "Experiment Name",
                field: "experimentName",
                editable: false,
                width: 200
            },
            {

                headerName: "Sample Name",
                field: "name",
                editable: false,
                width: 400
            }
        ];

    rowData:Array<any> =[];

    constructor(private analysisService:AnalysisService,
                private gnomexService: GnomexService,
                private orderValidateService: BrowseOrderValidateService,
                private secAdvisor: CreateSecurityAdvisorService,
                private constService:ConstantsService,
                private dialogService: DialogsService,
                private fb:FormBuilder,
                private route:ActivatedRoute,
                private dictionaryService: DictionaryService ) {
    }

    ngOnInit(){

        // rowdata  changes based off of grid selected. default is illumnia or longest array size?
        this.formGroup = this.fb.group({
            hybsJSONString: this.hybsList,
            lanesJSONString: this.lanesList,
            samplesJSONString: this.sampleList
        });

        this.analysisService.addAnalysisOverviewFormMember(this.formGroup, this.constructor.name);


        this.labList = this.gnomexService.labList;
        this.options = {
            displayField: 'label',
            allowDrag: (node: any) =>{return node.level > 1 && this.edit}
        };


        this.selectedTreeNodeSubscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data =>{
                this.analysisTreeNode = data;
            });

        this.route.data.forEach((data: any) =>{
            if(data && data.analysis){
                this.analysis = data.analysis.Analysis;

                let expItems:Array<any> = Array.isArray(this.analysis.experimentItems) ? this.analysis.experimentItems:  [this.analysis.experimentItems];

                this.hybsList = this.gnomexService.getTargetNodeList(this.HYBS,expItems);
                this.lanesList = this.gnomexService.getTargetNodeList(this.SEQ_LANES, expItems);
                this.sampleList = this.gnomexService.getTargetNodeList(this.SAMPLE,expItems);

                this.formGroup.get("hybsJSONString").setValue(this.hybsList);
                this.formGroup.get("lanesJSONString").setValue(this.lanesList);
                this.formGroup.get("samplesJSONString").setValue(this.sampleList);


                this.onGridTypeChange();

                let lab = this.labList.filter( lab =>{
                    return lab.idLab === this.analysis.idLab
                });
                if(lab && lab.length === 1){
                    this.currentLab =  lab[0];
                    this.selectLab(this.currentLab);

                }

            }
        });


    }



    // lab combo methods
    compareByID(itemOne, itemTwo) {
        return itemOne && itemTwo && itemOne.idLab == itemTwo.idLab;
    }
    selectLab($event:any){
        this.showSpinner = true;
        let idLab:string = '';
        if($event.value ){
            idLab = $event.value.idLab ? $event.value.idLab : '';
        }else{
            idLab = $event.idLab ? $event.idLab : '';
        }



        let params:HttpParams = new HttpParams()
            .set("idLab", idLab )
            .set("showSamples",'N')
            .set("showCategory",'N')
            .set("showMyLabsAlways",'N')
            .set("searchPublicProjects",'N');


        this.analysisService.getExperimentPickList(params).pipe(first())
            .subscribe(resp =>{
                this.items = [];
                if(resp && resp.Project){
                    let projects:any[] = Array.isArray(resp) ? resp : resp.Project ? [resp.Project] : [];
                    this.buildTree(projects)
                }
                this.showSpinner = false;

            })



    }

    // tree methods

    buildTree(projects: any[]){
        for(let p of projects ){
            let requests:any[] = Array.isArray(p.Request) ? p.Request : p.Request ? [p.Request] : [];
            p.icon = this.constService.ICON_FOLDER;
            p.children = requests;
            for(let req of requests){
                if(!req.icon){
                    this.constService.getTreeIcon(req,"Request")
                }
                let sampItems : any[] = Array.isArray(req.Item) ? req.Item : req.Item ? [req.Item] : [];
                req.children = sampItems;

            }
        }
        this.items = projects;
    }

    treeOnSelect(event:any){

    }

    prepareExperimentItem(items:any[]):void{
        let lastAddedItemType:string = this.gridRaidoOpt;

        for(let item of items){
            if(item.type === this.HYBS){
                item.number = item.itemNumber ? item.itemNumber : '';
                if(!(this.hybsList.find((h)=> h.number === item.number ))){
                    this.hybsList.push(item);
                    lastAddedItemType = this.HYBS;
                }

            }else if(item.type === this.SEQ_LANES){
                item.idOrganism = ""; //backend populates value
                item.createDate = "";
                item.idSample = "";
                item.number = item.itemNumber ? item.itemNumber : '';
                if(!(this.lanesList.find((l) => l.number === item.number ))){
                    this.lanesList.push(item);
                    lastAddedItemType = this.SEQ_LANES;
                }


            }else if(item.type === this.SAMPLE){
                item.createDate = "";
                item.number = item.itemNumber ? item.itemNumber : '';
                if(!(this.sampleList.find((s) => s.number === item.number ))){
                    this.sampleList.push(item);
                    lastAddedItemType = this.SAMPLE;
                }
            }
        }
        this.gridRaidoOpt = lastAddedItemType;
        this.onGridTypeChange();

    }
    onDrop(event:any){
        let items = event.element.data;
        if(items.Item){
            items = Array.isArray(items.Item) ? items.Item : [items.Item];
        }else if(items){
            items =  Array.isArray(items) ? items : [items];
        }else{
            items =[];
        }

        this.prepareExperimentItem(items);
        this.formGroup.markAsDirty();


    }
    allowDrop(element){
        return true;
    }
    // grid methods
    navigateToRequest(event:any){
        let idHyb = event.data.idHybridization;
        if(idHyb){
            let expItems:Array<any> = Array.isArray(this.analysis.experimentItems) ? this.analysis.experimentItems:  [this.analysis.experimentItems];
            let allHybs:Array<any> = expItems.concat(this.hybsList);
            let hybItem = allHybs.find(ei => ei.idHybridization === idHyb);
            this.gnomexService.navByNumber(hybItem.idRequest + "R", true);
        }else{
            let idReq = event.data.idRequest;
            if(idReq){
                this.gnomexService.navByNumber(idReq +"R", true);
            }

        }
    }

    onGridTypeChange(){
        if(this.gridRaidoOpt === this.HYBS){
            this.colDefs = this.hybColDefs;
            this.rowData = this.hybsList;
        }else if(this.gridRaidoOpt === this.SEQ_LANES){
            this.colDefs = this.seqLaneColDefs;
            this.rowData = this.lanesList;
        }else if(this.gridRaidoOpt === this.SAMPLE){
            this.colDefs = this.sampleColDefs;
            this.rowData = this.sampleList;
        }


        if(this.gridOpt.api){
            this.gridOpt.api.setColumnDefs(this.colDefs);
            this.gridOpt.api.setRowData(this.rowData);
            this.gridOpt.api.sizeColumnsToFit();
        }
    }

    onGridReady(params) {
        this.onGridTypeChange();
    }
    adjustColumnSize(event:any){
        if(this.gridOpt.api){
            this.gridOpt.api.sizeColumnsToFit();
        }
    }

    clearAllItems(){
        if(this.gridRaidoOpt === this.HYBS ){
            this.hybsList = [];
            this.formGroup.get("hybsJSONString").setValue(this.hybsList);
            this.gridOpt.api.setRowData( this.hybsList);
        }else if(this.gridRaidoOpt === this.SEQ_LANES){
            this.lanesList = [];
            this.formGroup.get("lanesJSONString").setValue(this.lanesList);
            this.gridOpt.api.setRowData(this.lanesList);
        }else if(this.gridRaidoOpt === this.SAMPLE ){
            this.sampleList = [];
            this.formGroup.get("samplesJSONString").setValue(this.sampleList);
            this.gridOpt.api.setRowData(this.sampleList);
        }
        this.formGroup.markAsDirty();
    }
    removeItems() {
        let tmpRowData: Array<any> = [];

        this.gridOpt.api.forEachNode(node=> {
            if(!node.isSelected()){
                tmpRowData.push(node.data);
            }
        });


        if(this.gridRaidoOpt === this.HYBS ){
            this.hybsList = tmpRowData;
            this.formGroup.get("hybsJSONString").setValue(this.hybsList);
            this.gridOpt.api.setRowData( this.hybsList);
        }else if(this.gridRaidoOpt === this.SEQ_LANES){
            this.lanesList = tmpRowData;
            this.formGroup.get("lanesJSONString").setValue(this.lanesList);
            this.gridOpt.api.setRowData(this.lanesList);
        }else if(this.gridRaidoOpt === this.SAMPLE ){
            this.sampleList = tmpRowData;
            this.formGroup.get("samplesJSONString").setValue(this.sampleList);
            this.gridOpt.api.setRowData(this.sampleList);
        }
        this.formGroup.markAsDirty();

    }



    ngOnDestroy():void{
        this.selectedTreeNodeSubscript.unsubscribe();
    }

}
