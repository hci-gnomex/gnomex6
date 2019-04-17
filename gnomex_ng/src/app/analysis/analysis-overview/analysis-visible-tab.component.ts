import {Component, OnInit, Output, EventEmitter} from "@angular/core";
import {FormBuilder } from "@angular/forms";
import {Subscription} from "rxjs";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {GridOptions} from "ag-grid-community/main";
import {AnalysisService} from "../../services/analysis.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";


@Component({
    selector: "analysis-visiblity-tab",
    template: `
        <div class="flexbox-column">
            <div style="flex:1; display:flex; width:100%;">
                <ag-grid-angular style="width: 100%;" class="ag-theme-fresh"
                                 [gridOptions]="gridOpt"
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
        .flexbox-column{
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }
    `]
})
export class AnalysisVisibleTabComponent implements OnInit {
    @Output() saveSuccess = new EventEmitter();
    rowData: Array<any> = [];

    public gridOpt: GridOptions = {};
    public rowSelection: string = "single";
    public readonly name = "visibility";
    private filteredExperimentOverviewListSubscript: Subscription;
    private selectedTreeNodeSubscript: Subscription;
    private visList: Array<any>;
    private instList: Array<any>;

    private  displayModelFormatter = (params) =>  {
        if(params.value) {
            let display =  (<string>params.value).split(",");
            return display[0];
        }
        return "";
    }


    private valueChanging = (params): boolean => {
        let eList = this.analysisService.analysisList;
        let rowData = params.data;
        let field = params.colDef.field;


        if(params.newValue !== params.oldValue) {
            if(rowData.canUpdateVisibility === "Y"
                || this.secAdvisor.hasPermission(CreateSecurityAdvisorService.CAN_ACCESS_ANY_OBJECT)) {
                rowData.isDirty = "Y";
                rowData[field] = params.newValue;
                this.analysisService.dirty = true;
                return true;
            } else {
                this.dialogService.confirm("Visibility can only be changed by owner, lab manager, or GNomEx admins.", null);
                rowData[field] = params.oldValue;
            }
        }
        return false;
    }

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
            width: 150
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
            width: 350
        },
        {
            headerName:  "Visibility",
            field: "visStr",
            editable: true,
            width: 150,
            cellEditor: "select",
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
            width: 200,
            cellEditor: "select",
            cellEditorParams: {
                values: this.prepInstitutionList()
            },
            valueFormatter: this.displayModelFormatter,
            valueSetter: this.valueChanging
        }
    ];

    constructor(protected fb: FormBuilder, private analysisService: AnalysisService,
                private dictionaryService: DictionaryService, private secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService) {
    }

    onGridReady(params) {
    }
    adjustColumnSize(event: any) {
        if(this.gridOpt.api) {
            this.gridOpt.api.sizeColumnsToFit();
        }
    }


    ngOnInit() {
        this.visList = this.dictionaryService.getEntries(DictionaryService.VISIBILITY);
        this.instList = this.dictionaryService.getEntries(DictionaryService.INSTITUTION);

        this.filteredExperimentOverviewListSubscript = this.analysisService.getFilteredOverviewListObservable().subscribe( data => {
            this.rowData = data;
        });

        this.selectedTreeNodeSubscript = this.analysisService.getAnalysisOverviewListSubject().subscribe(data => {
            this.analysisService.analysisList.forEach(aObj => {
                this.setVisibility(aObj);
                this.setInstitution(aObj);

                let analysisTypeList = this.dictionaryService.getEntries(DictionaryService.ANALYSIS_TYPE);
                aObj["analysisType"] = this.findFromId(analysisTypeList, aObj["idAnalysisType"]);

                let organismList = this.dictionaryService.getEntries(DictionaryService.ORGANISM);
                aObj["organism"] = this.findFromId(organismList, aObj["idOrganism"]);

            });
            this.rowData = this.analysisService.analysisList;
        });

        this.analysisService.getSaveMangerObservable().subscribe(saveType => {
            if(this.name === saveType) {
                this.save();
            }
        });
    }

    setVisibility(reqObj: any): void {

        let visObj = this.visList.find(vis => vis.value === reqObj.codeVisibility);
        let visStr: string = visObj.display + "," + reqObj.codeVisibility;
        reqObj["visStr"] = visStr;


    }
    setInstitution(reqObj: any): void {
        let instObj = this.instList.find(inst => inst.value === reqObj.idInstitution);
        let instStr: string = instObj.display + "," + reqObj.idInstitution;
        reqObj["instStr"] = instStr;

    }

    startEditingCell(event: any) {
        //console.log(event)
    }

    save(): void {
        let aList: Array<any> = this.analysisService.analysisList;

        let dirtyRequests = aList.filter(reqObj => reqObj.isDirty === "Y");

        if(!dirtyRequests || dirtyRequests.length  === 0) {
            this.saveSuccess.emit();
            return;
        }

        for(let dr of dirtyRequests) {
            dr.codeVisibility =  dr.visStr.split(",")[1];
            dr.idInstitution = dr.instStr.split(",")[1];
        }

        for(let i = 0; i < aList.length; i++) {
            if(aList[i].codeVisibility === "INST" && aList[i].idInstitution === "") {
                this.saveSuccess.emit();
                this.dialogService.confirm("Please specify an Institution for requests whose visibility is set to 'Institution'.", null);
                return;
            }
        }

        let params: HttpParams = new HttpParams();
        let strBody: string = JSON.stringify(dirtyRequests);
        params = params.set("visibilityXMLString", strBody );

        this.analysisService.saveVisibility(params).subscribe(resp => {
            this.saveSuccess.emit();
            if(this.analysisService.selectedNodeId) {
                this.analysisService.setActiveNodeId = this.analysisService.selectedNodeId;
                this.analysisService.selectedNodeId = "";
            } else {
                this.analysisService.analysisPanelParams["refreshParams"] = true;
            }

            this.analysisService.getAnalysisGroupList_fromBackend(this.analysisService.analysisPanelParams, true);
        }, (err: IGnomexErrorResponse) => {
        });
    }

    prepVisList(): Array<string> {
        if(!this.visList) {
            this.visList = this.dictionaryService.getEntries(DictionaryService.VISIBILITY);
        }

        let visDisplays = [];

        if(this.visList) {
            for(let vObj of this.visList) {
                visDisplays.push(vObj.display +  "," + vObj.value );
            }
            return visDisplays;
        }

        return visDisplays;
    }

    prepInstitutionList(): Array<string> {
        if(!this.instList) { // for first time you need to set it, this code runs before ngOinit
            this.instList = this.dictionaryService.getEntries(DictionaryService.INSTITUTION);
        }

        let instDisplays = [];

        if(this.instList) {
            for(let iObj of this.instList) {
                instDisplays.push(iObj.display + ","  + iObj.value );
            }
            return instDisplays;
        }

        return instDisplays;
    }

    findFromId(nameList: Array<any>, id: string): string {
        let nameObj = nameList.find(name => {
            return name["value"] === id;
        });

        return nameObj["display"];
    }

    ngOnDestroy(): void {
        this.filteredExperimentOverviewListSubscript.unsubscribe();
        this.selectedTreeNodeSubscript.unsubscribe();
    }

}




