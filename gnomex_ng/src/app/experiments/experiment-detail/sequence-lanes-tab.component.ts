import {Component,OnInit,OnDestroy,ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {Subscription} from "rxjs/Subscription";

import {GridOptions} from "ag-grid/main";

import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentViewService} from "../../services/experiment-view.service";
import {DictionaryService} from "../../services/dictionary.service";

@Component({
    selector: "sequence-lanes-tab",
    template: `
<form class="form-horizontal" (ngSubmit)="save()" [formGroup]="sequenceLanesTabFormGroup">
    <fieldset>
    </fieldset>
</form>
<div>
    <ag-grid-angular class="ag-theme-fresh"
                     style="height: 500px; width: 1200px;"
                     [gridOptions]="gridOptions"
                     [rowData]="gridRows"
                     [columnDefs]="gridColumns"
                     enableColResize="true"
                     suppressMovableColumns="true"
                     suppressColumnVirtualisation="true"
                     (gridReady)="resizeColumns()"
                     (modelUpdated)="resizeColumns()"
    ></ag-grid-angular>
</div>
`
})
//                    suppressClickEdit="true"

export class SequenceLanesTabComponent extends PrimaryTab implements OnInit, OnDestroy {

    sequenceLanesTabFormGroup:FormGroup;
    name: string = "Sequence Lanes";
    experiment: any;

    private experimentSubscription: Subscription;

    gridOptions: GridOptions = {};

    gridRows: any[] = [];

    dataMemberData: any[] = [
        "Mercury",
        "Venus",
        "Earth",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
    ];

    gridColumns: any[] = [
        {headerName: "multiplexLaneNumber", field: "multiplexLaneNumber"},
        {headerName: "ID",                  field: "number"},
        {
            headerName: "Inline Data",
            field: "inlineData",
            cellEditor: "select",
            cellEditorParams: {
                values: [
                    "Mercury",
                    "Venus",
                    "Earth",
                    "Mars",
                    "Jupiter",
                    "Saturn",
                    "Uranus",
                    "Neptune",
                ]
            },
            editable: true
        },
        {
            headerName: "Data Member",
            field: "dataMember",
            cellEditor: "select",
            cellEditorParams: {
                values: this.dataMemberData
            },
            editable: true
        },
        {headerName: "Sample Name",         field: "sampleName"},
        {headerName: "Sample ID",           field: "sampleNumber"},
        {headerName: "Illumina Barcode B",  field: "barcodeDisplayB"},
        {headerName: "Illumina Barcode",    field: "barcodeDisplay"},
        {headerName: "Sequencing Protocol", field: "sequencingProtocolDisplay"},
        {headerName: "Status in Workflow",  field: "workflowStatus"},
        {headerName: "Flow Cell #",         field: "flowCellNumber"},
        {headerName: "Channel",             field: "flowCellChannelNumber"},
        {headerName: "Last Cycle Status",   field: "lastCycleStatus"},
    ];

    resizeColumns(): void {
        this.gridOptions.columnApi.autoSizeAllColumns();
    }

    constructor(protected fb: FormBuilder, private experimentViewService:ExperimentViewService, private dictionaryService:DictionaryService) {
        super(fb,experimentViewService);
    }

    save(){
    }

    ngOnInit(){
        this.setExperiment(this.experimentViewService.getExperiment());
        this.experimentSubscription = this.experimentViewService.getExperimentObservable().subscribe((experiment) => {
            this.setExperiment(experiment);
        });
        let tabName = this.constructor.name;
        this.sequenceLanesTabFormGroup = this.fb.group({});
    }

    setExperiment(experiment) {
        this.experiment = experiment;
        this.updateGrid();
    }

    updateGrid() {
        let newGridRows = [];
        let multiplexLanes = [];
        if (this.experiment.multiplexSequenceLanes) {
            if (Array.isArray(this.experiment.multiplexSequenceLanes)) {
                multiplexLanes = this.experiment.multiplexSequenceLanes;
            } else {
                multiplexLanes = [this.experiment.multiplexSequenceLanes.MultiplexLane];
            }
        }
        for (let multiplexLane of multiplexLanes) {
            let sequenceLanes = this.asArray(multiplexLane.SequenceLane);
            for (let sequenceLane of sequenceLanes) {
                let newSequenceLane = {};
                newSequenceLane["multiplexLaneNumber"] = multiplexLane.number;
                newSequenceLane["number"] = sequenceLane.number;
                newSequenceLane["sampleName"] = sequenceLane.sampleName;
                newSequenceLane["sampleNumber"] = sequenceLane.sampleNumber;
                newSequenceLane["barcodeDisplay"] = this.dictionaryService.getEntryDisplay(DictionaryService.OLIGO_BARCODE, sequenceLane.sampleIdOligoBarcode);
                newSequenceLane["barcodeDisplayB"] = this.dictionaryService.getEntryDisplay(DictionaryService.OLIGO_BARCODE, sequenceLane.sampleIdOligoBarcodeB);
                newSequenceLane["sequencingProtocolDisplay"] = this.dictionaryService.getEntryDisplay(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED, sequenceLane.idNumberSequencingCyclesAllowed);
                newSequenceLane["workflowStatus"] = sequenceLane.workflowStatus;
                newSequenceLane["flowCellNumber"] = sequenceLane.flowCellNumber;
                newSequenceLane["flowCellChannelNumber"] = sequenceLane.flowCellChannelNumber;
                newSequenceLane["lastCycleStatus"] = sequenceLane.lastCycleStatus;

                newSequenceLane["inlineData"] = "Earth";
                newSequenceLane["dataMember"] = "Earth";

                newGridRows.push(newSequenceLane);
            }
        }
        this.gridRows = newGridRows;
    }

    ngOnDestroy(): void {
        if (this.experimentSubscription) {
            this.experimentSubscription.unsubscribe();
        }
    }

    /**
     * Helper method to array-ify an object. Useful for dealing with JSON object properties that have been converted from XML.
     * Converts a null or undefined object to an empty array.
     * Returns an array object unchanged.
     * Converts a single object into an array containing that object.
     * @param object
     * @returns {any}
     */
    asArray(object) {
        if (!object) {
            return [];
        }
        if (Array.isArray(object)) {
            return object;
        }
        return [object];
    }

}
