import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {OrderType} from "../../util/annotation-tab.component";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {SamplesService} from "../../services/samples.service";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {UploadSampleSheetComponent} from "../../upload/upload-sample-sheet.component";

@Component({
    selector: "tabSamplesView",
    templateUrl: "./tab-samples-illumina.html",
    styles: [`
        .tooltip-line-break {
            white-space: pre-line;
        }
        .sample-instructions {
            background-color: lightyellow;
            width: 45%;
            font-size: 80%;
        }
        /*For achieving wrap around column header*/
        ::ng-deep .ag-header-cell-text {
            text-overflow: clip !important;
            overflow: visible !important;
            white-space: normal !important;
        }

    `]
})

export class TabSamplesIlluminaComponent implements OnInit {
    public samplesGridColumnDefs: any[];
    public samplesGridApi: any;
    // public samplesGridRowData: any[] = [];
    public sampleTypes: any[] = [];
    public organisms: any[] = [];
    public form: FormGroup;
    private isExternal: boolean;

    constructor(private dictionaryService: DictionaryService,
                private constService: ConstantsService,
                private gnomexService: GnomexService,
                private fb: FormBuilder,
                private dialog: MatDialog,
                private samplesService: SamplesService,
                private newExperimentService: NewExperimentService) {
        this.organisms = this.dictionaryService.getEntries("hci.gnomex.model.OrganismLite");

        this.isExternal = !this.gnomexService.isInternalExperimentSubmission;
        this.newExperimentService.samplesGridColumnDefs = [
            {headerName: "", field: "index", width: 50},
            {
                headerName: "Multiplex Group",
                editable: true,
                field: "multiplexGroupNumber",
                width: 100,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample'
            },

            {headerName: "Sample Name",
                field: "name",
                width: 100,
                editable: true,
            },
            {headerName: "Conc. (ng/ul)",
                field: "concentration",
                width: 100,
                editable: true,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample'
            },
            {headerName: "Vol. (ul)",
                field: "volumne",
                width: 100,
                editable: true,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample'
            },
            {headerName: "# Seq Lanes",
                field: "numLanes",
                width: 100,
                editable: true,cellEditorFramework: TextAlignLeftMiddleEditor,

                showFillButton: true,
                fillGroupAttribute: 'idSample',
                headerTooltip: "This is the number of times(1 or greater) that you want to sequence this sample.",
                cellStyle: {color: 'black', 'background-color': 'LightGreen'}
            },
            {
                headerName: "Sample Type",
                editable: true,
                width: 175,
                field: "idSampleType",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.newExperimentService.sampleTypes,
                selectOptionsDisplayField: "sampleType",
                selectOptionsValueField: "idSampleType",
                showFillButton: true,
                fillGroupAttribute: 'idSampleType'
            },
            {
                headerName: "Organism",
                editable: true,
                width: 200,
                field: "idOrganism",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.organisms,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOrganism",
                showFillButton: true,
                fillGroupAttribute: 'idOrganism'
            },
            {
                headerName: "Seq Lib Protocol",
                editable: false,
                width: 200,
                field: "idOrganism",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            },

        ];
        this.form = this.fb.group({})

    }

    ngOnInit() {
        this.newExperimentService.propEntriesChanged.subscribe((value) =>{
            if (value && this.newExperimentService.samplesGridApi) {
                if (this.newExperimentService.propEntriesChanged.value === true) {
                    this.newExperimentService.propEntriesChanged.next(false);
                }
                if (this.newExperimentService.numSamples > 0) {
                    this.buildInitialRows();
                }
            }
            if (this.newExperimentService.samplesGridApi && this.newExperimentService.numSamples) {
                this.newExperimentService.samplesGridApi.forEachNode((node: any) => {
                    if (node.data.name === this.newExperimentService.sampleType) {
                        node.setSelected(true);
                    }
                });
            }
        });
        this.newExperimentService.sampleTypeChanged.subscribe((value) =>{
            this.changeSampleType();
            if (this.newExperimentService.sampleTypeChanged.value === true) {
                this.newExperimentService.sampleTypeChanged.next(false);
            }

        });

        this.sampleTypes = this.samplesService.filterSampleTypes(this.dictionaryService.getEntries("hci.gnomex.model.SampleType"), null);
        this.showHideColumns();
    }

    showHideColumns() {
        this.isExternal = !this.gnomexService.isInternalExperimentSubmission;
        let hideSampleTypeOnExternalExperiment: boolean = false;
        if (this.isExternal && this.gnomexService.getProperty(this.gnomexService.PROPERTY_HIDE_SAMPLETYPE_ON_EXTERNAL_EXPERIMENT) === "Y") {
            hideSampleTypeOnExternalExperiment = true;
        }


    }

    buildInitialRows() {
        if (this.newExperimentService.organism) {
            this.newExperimentService.samplesGridRowData = [];
            for (let i = 0; i < this.newExperimentService.numSamples; i++) {
                let obj = {
                    index: i + 1,
                    mGroup: "",
                    name: "",
                    concentration: "",
                    volume: "",
                    numLanes: "1",
                    idSampleType: this.newExperimentService.sampleType.idSampleType,
                    idOrganism: this.newExperimentService.organism.idOrganism
                };
                this.newExperimentService.samplesGridRowData.push(obj);
            }
            this.newExperimentService.sampleOrganisms.add(this.newExperimentService.organism);
            this.newExperimentService.samplesGridApi.setColumnDefs(this.newExperimentService.samplesGridColumnDefs);
            this.newExperimentService.samplesGridApi.setRowData(this.newExperimentService.samplesGridRowData);
            this.newExperimentService.samplesGridApi.sizeColumnsToFit();
            this.newExperimentService.samplesChanged.next(true);

        }
    }

    changeSampleType() {
        if (this.newExperimentService.samplesGridApi) {
            this.newExperimentService.samplesGridApi.forEachNode((node: any) => {
                node.data.idSampleType = this.newExperimentService.sampleType.idSampleType;
            });
            this.newExperimentService.samplesGridApi.redrawRows();
        }
    }

    onSamplesGridReady(params) {
        this.newExperimentService.samplesGridApi = params.api;
        params.api.setHeaderHeight(50);
    }

    onSamplesGridRowDataChanged() {
    }

    onEverythingChanged(event) {
        this.newExperimentService.samplesGridApi.sizeColumnsToFit();
        this.newExperimentService.samplesGridApi.setRowData(this.newExperimentService.samplesGridRowData);

    }

    onSamplesGridRowSelected() {
    }

    onCellValueChanged(event) {
        if (event.colDef.headerName === "Organism") {
            let organism = this.organisms.filter(org => org.idOrganism === event.data.idOrganism);
            this.newExperimentService.sampleOrganisms.add(organism[0]);
            this.newExperimentService.samplesChanged.next(true);
        }

    }

    upload(): void {
        let data = {
            sampleColumns: this.newExperimentService.samplesGridColumnDefs,
            rowData: this.newExperimentService.samplesGridRowData
        };

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.height = '45em';
        config.panelClass = 'no-padding-dialog';
        config.data = data;

        let dialogRef = this.dialog.open(UploadSampleSheetComponent, config);

        dialogRef.afterClosed().subscribe((result) => {

            // finish putting the new data into the grid
            this.newExperimentService.samplesGridApi.refreshCells();
            // this.newExperimentService.samplesGridApi.setRowData(result);

            // TODO
            //// This stuff needs to be handled when the result comes back.
            //// Compare to UploadSampleSheetsView.mxml end of clickPopulateFieldsButtonAfterWarning()

            // if (tabSamplesView.hasPlates() && samplesViewState != 'IScanState') {
            //     tabSamplesView.fillPlates();
            // }
            // if ( samplesViewState == 'IScanState'){
            //     tabSamplesView.initializeSamplesGrid();
            // }
            //
            // tabSamplesView.propagateBarcode();
            // sampleGridDataRows.refresh();
            // if(sampleGroupingCollection != null) {
            //     sampleGroupingCollection.refresh(false);
            // }
            //
            // callLater(tabSamplesView.checkSamplesCompleteness);
        });
    }
}