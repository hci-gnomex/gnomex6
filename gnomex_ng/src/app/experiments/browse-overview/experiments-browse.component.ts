import {AfterViewChecked, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PrimaryTab} from "../../util/tabs/primary-tab.component";
import {FormBuilder} from "@angular/forms";
import {ExperimentsService} from "../experiments.service";
import {GnomexStyledGridComponent} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component"
import {Subscription} from "rxjs/Subscription";
import {DictionaryService} from "../../services/dictionary.service";
import {ConstantsService} from "../../services/constants.service";
import {Router} from "@angular/router";

@Component({
    template: `

        <!--- <grid dataProvider={} > -->
        <div style="display:block; height:100%; width:100%;">
            <GnomexStyledGrid 
                    [selectionSetting]="SINGLE_ROW"
                    (rowDoubleClicked)="forwardToExperiment($event)"
                    [styleForTheme]="style">
            </GnomexStyledGrid>
        </div>
    `
})
export class ExperimentsBrowseTab extends PrimaryTab implements OnInit,OnDestroy{
    @ViewChild(GnomexStyledGridComponent) myGrid: GnomexStyledGridComponent;
    private selectedTreeNodeSubscript: Subscription;
    private filteredExperimentOverviewListSubscript: Subscription;
    public readonly SINGLE_ROW: string = "singlerow";
    public readonly style:string = "gnomex5_browse_experiment";

    name:string = "Experiments";



    //Override
    setState(){
        this.myGrid.resizeIfNeeded();
    }

    private iconCellRenderer = (row: number, column: any, imgSource: any) =>{

        return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">
							<img src="` + imgSource +`" alt=""/>` +
        `</div>`;
    };
    private experimentNumberCellsRenderer = (row: number, column: any, value: any): any => {
        let imgSource = this.source.localdata[row].icon;
        return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">
							<img src="` + imgSource +`" alt=""/>` + value +
            `</div>`;
    };
    private textCellsRenderer = (row: number, column: any, value: any): any => {
        return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">` + value + `</div>`;
    };


    private columns: any[] = [
        {text: "# ",        datafield: "requestNumber", 	width: "4%", cellsrenderer: this.experimentNumberCellsRenderer },
        {text: "Date",      datafield: "requestCreateDateDisplay", 	width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Requester", datafield:"ownerFullName", width: "6%", cellsrenderer: this.textCellsRenderer},
        {text: "Project",   datafield: "projectName", width: "8%", cellsrenderer: this.textCellsRenderer},
        {text: "Experiment Kind", datafield:"experimentKind",  width: "31%", cellsrenderer: this.textCellsRenderer},
        {text: "Microarray", datafield: "slideProductName",    width: "7%", cellsrenderer: this.textCellsRenderer},
        {text: "Analysis?",datafield: "analysisChecked", 	  width: "7%", cellsrenderer: this.iconCellRenderer},
        {text: "Analysis Names",   datafield: "analysisNames", width: "30%", cellsrenderer: this.textCellsRenderer},
    ];

    private source = {
        datatype: "json",
        localdata: [],
        datafields: [
            {name: "requestNumber", type: "string"},
            {name: "requestCreateDateDisplay", type: "string"},
            {name: "ownerFullName", type: "string"},
            {name: "projectName", type: "string"},
            {name: "experimentKind", type: "string"},
            {name: "slideProductName", type: "string"},
            {name: "analysisChecked", type: "string"},
            {name: "analysisNames", type: "string"},
        ]
    };
    constructor(protected fb: FormBuilder, private experimentService:ExperimentsService,
                private dictionary: DictionaryService, private appConstants: ConstantsService,
                private router:Router) {
        super(fb);
    }



    ngOnInit(){

        this.myGrid.setColumns(this.columns);
        this.myGrid.setDataAdapterSource(this.source);

        this.filteredExperimentOverviewListSubscript = this.experimentService.getFilteredOverviewListObservable()
            .subscribe( data =>{
                this.updateGridData(data);
            });
        this.selectedTreeNodeSubscript = this.experimentService.getExperimentOverviewListSubject()
            .subscribe(data =>{
                this.updateGridData(this.experimentService.experimentList);
            });

    }




    updateGridData(data:Array<any>):void{
        this.source.localdata = Array.isArray(data) ? data :[data];
        this.myGrid.setDataAdapterSource(this.source);
        //this.myGrid.selectedrowindexes([]);

    }



    forwardToExperiment($event:any){

        let rowData = $event.args.row.bounddata;
        let experimentNode = this.experimentService.experimentList
            .find(reqObj => reqObj.requestNumber === rowData.requestNumber);
        this.router.navigate(['/experiments',{outlets:{'browsePanel':[experimentNode.idRequest]}}]);

    }

    ngOnDestroy():void{
        this.filteredExperimentOverviewListSubscript.unsubscribe();
        this.selectedTreeNodeSubscript.unsubscribe();
    }




}