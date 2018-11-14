import {Component,OnInit,OnDestroy,ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {Subscription} from "rxjs";

import {GridOptions} from "ag-grid-community/main";

import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentViewService} from "../../services/experiment-view.service";
import {DictionaryService} from "../../services/dictionary.service";

@Component({
    selector: "samples-tab",
    template: `
<form class="form-horizontal" (ngSubmit)="save()" [formGroup]="samplesTabFormGroup">
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
                     suppressClickEdit="true"
                     suppressColumnVirtualisation="true"
                     (gridReady)="resizeColumns()"
                     (modelUpdated)="resizeColumns()"
    ></ag-grid-angular>
</div>
`
})
export class SamplesTabComponent extends PrimaryTab implements OnInit, OnDestroy {

    samplesTabFormGroup:FormGroup;
    name: string = "Samples";
    experiment: any;

    private experimentSubscription: Subscription;

    gridOptions: GridOptions = {};

    gridRows: any[] = [];

    // External only uses ID, Sample Name, ANNOTATIONS, Sample Type, Prepped by Core

    gridColumns: any[] = [
        {headerName: "Sample ID", field: "idSample"},
    ];

    private columnsBeforeAnnotations: any[] = [
        {headerName: "Multiplex Group #", field: "multiplexGroupNumber"},
        {headerName: "ID", field: "number"},
        {headerName: "Sample Name", field: "name"},
        {headerName: "Conc: (ng/uL)", field: "concentration"},
        {headerName: "Vol. (uL)", field: "sampleVolume"},
    ];

    private columnsAfterAnnotations: any[] = [
        {headerName: "Sample Type", field: "sampleType"},
        {headerName: "Organism", field: "organismDisplay"},
        {headerName: "QC Conc.", field: "qcLibConcentration"},
        {headerName: "QC RIN", field: "qualRINNumber"},
        {headerName: "Seq Lib Protocol", field: "seqLibProtocolDisplay"},
        {headerName: "Prepped by Core", field: "seqPrepByCore"},
        // Try 12405R and 12465R
        {headerName: "Index Tag A", field: "barcodeA"},
        {headerName: "Index Tag Sequence A", field: "barcodeSequence"},
        {headerName: "Index Tag B", field: "barcodeB"},
        {headerName: "Index Tag Sequence B", field: "barcodeSequenceB"},
        {headerName: "Ave Insert Size", field: "meanLibSizeActual"},
        {headerName: "QC Frag Size (from)", field: "qualFragmentSizeFrom"},
        {headerName: "QC Frag Size (to)", field: "qualFragmentSizeTo"},
        {headerName: "QC Status", field: "qualStatus"},
        {headerName: "Seq Lib Prep Status", field: "seqPrepStatus"},
        {headerName: "Core to prep lib?", field: "seqPrepByCoreRepeated"},
        {headerName: "Seq Lib Conc. ng/uL", field: "qualCalcConcentration"},
    ];

    resizeColumns(): void {
        this.gridOptions.columnApi.autoSizeAllColumns();
    }

    constructor(protected fb: FormBuilder,
                private experimentViewService: ExperimentViewService,
                private dictionaryService:DictionaryService) {
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
        this.samplesTabFormGroup = this.fb.group({});
    }

    setExperiment(experiment) {
        this.experiment = experiment;
        this.updateGrid();
    }

    updateGrid() {
        let columns = [];
        columns = columns.concat(this.columnsBeforeAnnotations);
        for (let propertyEntry of this.experiment.PropertyEntries) {
            if (propertyEntry.isSelected == "true") {
                columns.push({
                    headerName: propertyEntry.name,
                    field: "ANNOT" + propertyEntry.idProperty
                });
            }
        }
        columns = columns.concat(this.columnsAfterAnnotations);
        let samples = this.experiment.samples;
        for (let sample of samples) {
            sample.organismDisplay = sample.idOrganism;
            sample.seqLibProtocolDisplay = sample.idSeqLibProtocol;
            sample.seqPrepByCoreRepeated = sample.seqPrepByCore;
            sample.barcodeDisplay = this.dictionaryService.getEntryDisplay(DictionaryService.OLIGO_BARCODE, sample.sampleIdOligoBarcode);
            sample.barcodeDisplayB = this.dictionaryService.getEntryDisplay(DictionaryService.OLIGO_BARCODE, sample.sampleIdOligoBarcodeB);
        }
        this.gridColumns = columns;
        this.gridRows = samples;
    }

    ngOnDestroy(): void {
        if (this.experimentSubscription) {
            this.experimentSubscription.unsubscribe();
        }
    }

}
