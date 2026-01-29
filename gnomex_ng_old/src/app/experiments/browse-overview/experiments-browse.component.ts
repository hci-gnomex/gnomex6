import {AfterViewChecked, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PrimaryTab} from "../../util/tabs/primary-tab.component";
import {FormBuilder} from "@angular/forms";
import {ExperimentsService} from "../experiments.service";
import {Subscription} from "rxjs";
import {DictionaryService} from "../../services/dictionary.service";
import {ConstantsService} from "../../services/constants.service";
import {Router} from "@angular/router";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {GridOptions} from "ag-grid-community/main";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";

@Component({
    selector: "experiment-browse-tab",
    template: `

        <!--- <grid dataProvider={} > -->
        <div style="height:100%; width:100%; display:flex; flex-direction: column;">
            <div style="display:flex; flex-direction:column; flex:1; width:100%;">
                <ag-grid-angular class="ag-theme-fresh" style="width: 100%;  height: 100%;" 
                                 (cellDoubleClicked)="forwardToExperiment($event)"
                                 (gridSizeChanged)="adjustColumnSize($event)"
                                 [gridOptions]="gridOpt" 
                                 [rowData]="rowData" 
                                 [columnDefs]="columnDefs" 
                                 [rowSelection]="rowSelection" 
                                 [rowDeselection]="true" 
                                 [enableSorting]="true"
                                 [enableColResize]="true">
                </ag-grid-angular>
            </div>
        </div>
    `
})
export class ExperimentsBrowseTab extends PrimaryTab implements OnInit,OnDestroy{
    private selectedTreeNodeSubscript: Subscription;
    private filteredExperimentOverviewListSubscript: Subscription;
    public readonly rowSelection: string = "single";
    public gridOpt:GridOptions = {};

    name:string = "Experiments";

    columnDefs = [
        {headerName: "#", editable: false, field: "requestNumber", width: 150, cellRendererFramework: IconTextRendererComponent},
        {headerName: "Date", editable: false, field: "requestCreateDateDisplay", width:150},
        {headerName: "Requester", editable: false, field: "ownerFullName", width: 200},
        {headerName: "Project", editable: false, field: "projectName", width:150},
        {headerName: "Experiment Type", editable:false, field:"experimentKind", width:300},
        {headerName: "Microarray", editable:false, field:"slideProductName", width:200, },
        {headerName: "Analysis?", editable:false, checkboxEditable: false, field:"analysisChecked", width:150, cellRendererFramework: CheckboxRenderer},
        {headerName: "Analysis Names", editable:false, field:"analysisNames",width:300}
    ];

    rowData:Array<any> = [];

    constructor(protected fb: FormBuilder,
                private experimentService:ExperimentsService,
                private dictionary: DictionaryService,
                private appConstants: ConstantsService,
                private router:Router) {
        super(fb);
    }

    ngOnInit(){
        this.filteredExperimentOverviewListSubscript = this.experimentService.getFilteredOverviewListObservable().subscribe( data =>{
            this.rowData = data;
        });
        this.selectedTreeNodeSubscript = this.experimentService.getExperimentOverviewListSubject().subscribe(data =>{
            this.rowData = this.experimentService.experimentList;
        });
    }

    adjustColumnSize(event:any){
        if(this.gridOpt.api){
            this.gridOpt.api.sizeColumnsToFit();
        }
    }

    forwardToExperiment(event:any){
        let rowData = event.data;
        let experimentNode = this.experimentService.experimentList
            .find(reqObj => reqObj.requestNumber === rowData.requestNumber);
        this.router.navigate(['/experiments',{outlets:{'browsePanel':[experimentNode.idRequest]}}]);
    }

    ngOnDestroy():void{
        this.filteredExperimentOverviewListSubscript.unsubscribe();
        this.selectedTreeNodeSubscript.unsubscribe();
    }
}