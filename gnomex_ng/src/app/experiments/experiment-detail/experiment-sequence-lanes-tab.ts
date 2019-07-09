import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent} from "ag-grid-community";
import {ActivatedRoute} from "@angular/router";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ExperimentsService} from "../experiments.service";
import {DictionaryService} from "../../services/dictionary.service";
import {IconRendererComponent} from "../../util/grid-renderers";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {AgGridNg2} from "ag-grid-angular";

@Component({
    selector: 'experiment-sequence-lanes-tab',
    template: `
        <div class="padded full-height">
            <as-split>
                <as-split-area [size]="this.sampleGridSplitSize">
                    <div class="flex-container-col full-height padded">
                        <label>Samples</label>
                        <div class="flex-grow">
                            <ag-grid-angular class="ag-theme-balham full-height full-width"
                                             (gridReady)="this.onSamplesGridReady($event)"
                                             (gridSizeChanged)="this.onGridSizeChanged($event)"
                                             (selectionChanged)="this.onSamplesGridSelectionChanged($event)"
                                             [rowSelection]="'single'"
                                             [columnDefs]="this.samplesGridColDefs"
                                             [rowData]="this.samplesGridData">
                            </ag-grid-angular>
                        </div>
                    </div>
                </as-split-area>
                <as-split-area [size]="100 - this.sampleGridSplitSize">
                    <div class="flex-container-col full-height padded">
                        <label>Sequence Lanes (to assign sample to lane, select sample in left-hand grid and lane in right-hand grid and press "Assign to lane"</label>
                        <div class="flex-container-row">
                            <button mat-button [disabled]="!editMode || !this.canEdit || !this.selectedSample || this.selectedLanes.length !== 1" (click)="this.assignSampleToLane()">Assign to lane</button>
                            <button mat-button [disabled]="!editMode || !this.canEdit" (click)="this.addSequenceLane()"><img [src]="this.constantsService.ICON_ADD" class="icon">Add sequence lane</button>
                            <button mat-button [disabled]="!editMode || !this.canEdit || this.selectedLanes.length < 1" (click)="this.copySequenceLane()"><img [src]="this.constantsService.ICON_TABLE_MULTIPLE" class="icon">Copy sequence lane</button>
                            <button mat-button [disabled]="!editMode || !this.canEdit || this.selectedLanes.length < 1" (click)="this.promptToDeleteSequenceLane()"><img [src]="this.constantsService.ICON_DELETE" class="icon">Delete sequence lane(s)</button>
                        </div>
                        <div class="flex-grow">
                            <ag-grid-angular #lanesGrid
                                             class="ag-theme-balham full-height full-width"
                                             stopEditingWhenGridLosesFocus="true"
                                             (gridReady)="this.onLanesGridReady($event)"
                                             (gridSizeChanged)="this.onGridSizeChanged($event)"
                                             (selectionChanged)="this.onLanesGridSelectionChanged($event)"
                                             [rowSelection]="'multiple'"
                                             [enableColResize]="'true'"
                                             [singleClickEdit]="'true'"
                                             [columnDefs]="this.lanesGridColDefs"
                                             [rowData]="this.lanesGridData">
                            </ag-grid-angular>
                        </div>
                    </div>
                </as-split-area>
            </as-split>
        </div>
    `,
    styles: [`
    `],
})
export class ExperimentSequenceLanesTab implements OnInit, OnChanges {
    @ViewChild("lanesGrid") lanesGrid: AgGridNg2;
    
    @Input() editMode: boolean;

    public sampleGridSplitSize: number = 0;
    public canEdit: boolean = false;
    private sampleNameMap: Map<string, string>;

    private samplesGridApi: GridApi;
    public samplesGridColDefs: any[] = [];
    public samplesGridData: any[] = [];
    private selectedSample: any = null;

    private lanesGridApi: GridApi;
    public lanesGridColDefs: any[] = [];
    public lanesGridData: any[] = [];
    public selectedLanes: any[] = [];

    private lanesToRemove: any[] = [];

    private valueChanging = (params): boolean => {
        let rowData = params.data;
        let field = params.colDef.field;
        
        if (params.newValue !== params.oldValue) {
            rowData.isDirty = "Y";
            rowData[field] = params.newValue;
            this.experimentsService.experimentOverviewForm.markAsDirty();
            return true;
        } else {
            rowData[field] = params.oldValue;
            return false;
        }
    }
    
    constructor(public constantsService: ConstantsService,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
                private experimentsService: ExperimentsService,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {
    }

    ngOnInit(): void {
        const workflowStatusList: any[] = [
            {value: "", display: ""},
            {value: this.constantsService.STATUS_IN_PROGRESS, display: "In Progress"},
            {value: this.constantsService.STATUS_COMPLETED, display: "Complete"},
            {value: this.constantsService.STATUS_ON_HOLD, display: "On Hold"},
            {value: this.constantsService.STATUS_TERMINATED, display: "Terminate"},
            {value: this.constantsService.STATUS_BYPASSED, display: "Bypass"},
        ];
        const sequencingProtocolList: any[] = this.dictionaryService.getEntries(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED);

        this.samplesGridColDefs = [
            {headerName: "Name", headerTooltip: "Name", field: "name"},
            {width: 50, maxWidth: 50, cellRendererFramework: IconRendererComponent},
        ];

        this.route.data.forEach((data: any) => {
            this.sampleNameMap = new Map();
            this.lanesGridColDefs = [];
            this.samplesGridData = [];
            this.selectedSample = null;
            this.lanesGridData = [];
            this.selectedLanes = [];
            this.lanesToRemove = [];
            if (data && data.experiment && data.experiment.Request) {
                let request: any = data.experiment.Request;
                this.canEdit = request.isExternal !== 'Y' && this.createSecurityAdvisorService.isAdmin;

                this.lanesGridColDefs = [
                    {headerName: "ID", headerTooltip: "ID", field: "number"},
                    {headerName: "Sample Name", headerTooltip: "Sample Name", field: "sampleName"},
                    {headerName: "Sample ID", headerTooltip: "Sample ID", field: "sampleNumber"},
                    {headerName: "Sequencing Protocol", headerTooltip: "Sequencing Protocol",
                        field: "idNumberSequencingCyclesAllowed", editable: this.canEdit && this.editMode, cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor, selectOptions: sequencingProtocolList,
                        selectOptionsDisplayField: "display", selectOptionsValueField: "value",
                        showFillButton: true, fillAll: true, valueSetter: this.valueChanging},
                    {headerName: "Status in Workflow", headerTooltip: "Status in Workflow", field: "workflowStatus"},
                    {headerName: "Flow Cell #", headerTooltip: "Flow Cell #", field: "flowCellNumber"},
                    {headerName: "Channel", headerTooltip: "Channel", field: "flowCellChannelNumber"},
                    {headerName: "# Cycles (actual)", headerTooltip: "# Cycles (actual)", field: "numberSequencingCyclesActual"},
                    {headerName: "Last Cycle Status", headerTooltip: "Last Cycle Status", field: "lastCycleStatus", cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor, selectOptions: workflowStatusList, selectOptionsDisplayField: "display",
                        selectOptionsValueField: "value", editable: this.canEdit && this.editMode, valueSetter: this.valueChanging},
                    {headerName: "Pipeline Status", headerTooltip: "Pipeline Status", field: "pipelineStatus", cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor, selectOptions: workflowStatusList, selectOptionsDisplayField: "display",
                        selectOptionsValueField: "value", editable: this.canEdit && this.editMode, valueSetter: this.valueChanging},
                ];

                let samples: any[] = [];
                if (request.samples) {
                    samples = Array.isArray(request.samples) ? request.samples : [request.samples.Sample];
                }
                let lanes: any[] = [];
                if (request.sequenceLanes) {
                    lanes = Array.isArray(request.sequenceLanes) ? request.sequenceLanes : [request.sequenceLanes.SequenceLane];
                }

                this.setSampleLaneCounts(samples, lanes);
                this.setAllLaneSampleNames(samples, lanes);
                this.sortSequenceLanes(lanes);

                this.samplesGridData = samples;
                this.lanesGridData = lanes;

                setTimeout(() => {
                    if (this.lanesGridApi) {
                        this.lanesGridApi.sizeColumnsToFit();
                    }
                });
            }
        });
    }

    public prepareView(): void {
        this.sampleGridSplitSize = 25;
    }

    public onSamplesGridReady(event: GridReadyEvent): void {
        event.api.sizeColumnsToFit();
        this.samplesGridApi = event.api;
    }

    public onSamplesGridSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedSample = event.api.getSelectedRows()[0];
    }

    public onLanesGridReady(event: GridReadyEvent): void {
        event.api.sizeColumnsToFit();
        this.lanesGridApi = event.api;
        this.setEditMode();
    }
    
    setEditMode() {
        if (this.lanesGrid.columnApi.getColumn("idNumberSequencingCyclesAllowed")) {
            this.lanesGrid.columnApi.getColumn("idNumberSequencingCyclesAllowed").getColDef().editable = this.canEdit && this.editMode;
        }
        if (this.lanesGrid.columnApi.getColumn("lastCycleStatus")) {
            this.lanesGrid.columnApi.getColumn("lastCycleStatus").getColDef().editable = this.canEdit && this.editMode;
        }
        if (this.lanesGrid.columnApi.getColumn("pipelineStatus")) {
            this.lanesGrid.columnApi.getColumn("pipelineStatus").getColDef().editable = this.canEdit && this.editMode;
        }
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if(!changes["editMode"].isFirstChange()) {
            this.setEditMode();
        }
    }

    public onLanesGridSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedLanes = event.api.getSelectedRows();
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    private setSampleLaneCounts(samples: any[], lanes: any[]): void {
        let laneCountMap: any = {};
        for (let lane of lanes) {
            if (!laneCountMap[lane.idSample]) {
                laneCountMap[lane.idSample] = 0;
            }
            laneCountMap[lane.idSample]++;
        }
        let count: number;
        for (let sample of samples) {
            count = laneCountMap[sample.idSample] ? laneCountMap[sample.idSample] : 0;
            sample.laneCount = "" + count;
            sample.icon = count ? this.constantsService.ICON_CHECKED : "";
        }
    }

    private setAllLaneSampleNames(samples: any[], lanes: any[]): void {
        for (let sample of samples) {
            this.sampleNameMap.set(sample.idSample, sample.name);
        }
        for (let lane of lanes) {
            lane.sampleName = this.sampleNameMap.get(lane.idSample) ? this.sampleNameMap.get(lane.idSample) : "";
        }
    }

    private setLaneSampleName(lane: any): void {
        lane.sampleName = this.sampleNameMap.get(lane.idSample) ? this.sampleNameMap.get(lane.idSample) : "";
    }

    private sortSequenceLanes(lanes: any[]): void {
        lanes.sort((a: any, b: any) => {
            if (!a && !b) {
                return 0;
            } else if (!a) {
                return 1;
            } else if (!b) {
                return -1;
            } else {
                let sampleId1: string = a.idSample;
                let sampleId2: string = b.idSample;
                if (!sampleId1) {
                    return -1;
                } else if (!sampleId2) {
                    return 1;
                } else {
                    let isNew1: boolean = false;
                    let isNew2: boolean = false;
                    let int1: number = 0;
                    let int2: number = 0;
                    if (sampleId1.length > 6 && sampleId1.substring(0, 6) === "Sample") {
                        isNew1 = true;
                        int1 = parseInt(sampleId1.substring(6));
                    } else {
                        int1 = parseInt(sampleId1);
                    }
                    if (sampleId2.length > 6 && sampleId2.substring(0, 6) === "Sample") {
                        isNew2 = true;
                        int2 = parseInt(sampleId2.substring(6));
                    } else {
                        int2 = parseInt(sampleId2);
                    }
                    if (isNew1 && !isNew2) {
                        return 1;
                    } else if (!isNew1 && isNew2) {
                        return -1;
                    } else if (int1 === int2) {
                        let n1: string = a.number;
                        let n2: string = b.number;
                        let n1P: string[] = n1.split('_');
                        let n2P: string[] = n2.split('_');
                        let fcNum1: number = -1;
                        let fcNum2: number = -1;
                        if (n1P.length > 1) {
                            fcNum1 = parseInt(n1P[1]);
                            if (isNaN(fcNum1)) {
                                fcNum1 = -1;
                            }
                        }
                        if (n2P.length > 1) {
                            fcNum2 = parseInt(n2P[1]);
                            if (isNaN(fcNum2)) {
                                fcNum2 = -1;
                            }
                        }
                        return fcNum1 - fcNum2;
                    } else {
                        return int1 - int2;
                    }
                }
            }
        });
    }

    public assignSampleToLane(): void {
        if (this.selectedSample && this.selectedLanes.length === 1) {
            let selectedLane: any = this.selectedLanes[0];
            if (selectedLane.idSample !== "0") {
                this.dialogsService.alert("Cannot overwrite existing sample " + selectedLane.sampleName);
                return;
            }

            selectedLane.idSample = this.selectedSample.idSample;
            this.setLaneSampleName(selectedLane);
            this.lanesGridApi.setRowData(this.lanesGridData);
            this.selectedLanes = [];
        }
    }

    public addSequenceLane(): void {
        let template: any = this.selectedLanes.length > 0 ? this.selectedLanes[0] :
            (this.lanesGridData.length > 0 ? this.lanesGridData[this.lanesGridData.length - 1] : {});
        let newLane: any = {
            idSequenceLane: 'SequenceLane' + this.lanesGridData.length,
            idSeqRunType: template.idSeqRunType ? template.idSeqRunType : '',
            idNumberSequencingCycles: template.idNumberSequencingCycles ? template.idNumberSequencingCycles : '',
            idNumberSequencingCyclesAllowed: template.idNumberSequencingCyclesAllowed ? template.idNumberSequencingCyclesAllowed : '',
            idGenomeBuildAlignTo: '',
            canChangeSampleDesignations: 'Y',
            idSample: '0'
        };
        this.lanesGridData.push(newLane);
        this.lanesGridApi.setRowData(this.lanesGridData);
        this.selectedLanes = [];
    }

    public copySequenceLane(): void {
        for (let template of this.selectedLanes) {
            let newLane: any = {
                idSequenceLane: 'SequenceLane' + this.lanesGridData.length,
                idSeqRunType: template.idSeqRunType ? template.idSeqRunType : '',
                idNumberSequencingCycles: template.idNumberSequencingCycles ? template.idNumberSequencingCycles : '',
                idNumberSequencingCyclesAllowed: template.idNumberSequencingCyclesAllowed ? template.idNumberSequencingCyclesAllowed : '',
                idGenomeBuildAlignTo: template.idGenomeBuildAlignTo ? template.idGenomeBuildAlignTo : '',
                canChangeSampleDesignations: 'Y',
                idSample: template.idSample ? template.idSample : ''
            };
            this.setLaneSampleName(newLane);
            this.lanesGridData.push(newLane);
        }
        this.lanesGridApi.setRowData(this.lanesGridData);
        this.selectedLanes = [];
    }

    public promptToDeleteSequenceLane(): void {
        for (let lane of this.selectedLanes) {
            if (lane.idFlowCellChannel) {
                let title: string = "Warning";
                let message: string = "Lane " + lane.number + " is already loaded on flow cell " + lane.flowCellNumber
                    + "-" + lane.flowCellChannelNumber + ". Remove lane anyway?";
                this.dialogsService.confirm(title, message).subscribe((answer: boolean) => {
                    if (answer) {
                        this.deleteSequenceLane(lane);
                    }
                });
            } else {
                this.deleteSequenceLane(lane);
            }
        }
        this.selectedLanes = [];
        this.lanesGridApi.deselectAll();
    }

    private deleteSequenceLane(lane: any): void {
        this.lanesToRemove.push(lane);
        this.lanesGridData.splice(this.lanesGridData.indexOf(lane), 1);
        this.lanesGridApi.setRowData(this.lanesGridData);
    }

}
