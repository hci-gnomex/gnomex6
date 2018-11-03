import {AfterViewInit, Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {OrderType} from "../../util/annotation-tab.component";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {SamplesService} from "../../services/samples.service";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {UploadSampleSheetComponent} from "../../upload/upload-sample-sheet.component";
import {BarcodeSelectEditor} from "../../util/grid-editors/barcode-select.editor";
import {BehaviorSubject} from "rxjs";

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

export class TabSamplesIlluminaComponent implements OnInit, AfterViewInit {
    public samplesGridColumnDefs: any[];
    public samplesGridApi: any;
    // public samplesGridRowData: any[] = [];
    public sampleTypes: any[] = [];
    public organisms: any[] = [];
    public form: FormGroup;
    private isExternal: boolean;
    private hideCCNum: boolean = true;
    private gridColumnApi;
    private protocol: any;
    private formControlSet: boolean = false;

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
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                showFillButton: true,
                fillGroupAttribute: 'idSample',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Multiplex Group required'}
                ],
            },

            {headerName: "Sample Name",
                field: "name",
                width: 100,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Sample Name required'}
                ],

            },
            {headerName: "Conc. (ng/ul)",
                field: "concentration",
                width: 100,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample'
            },
            {headerName: "Vol. (ul)",
                field: "volumne",
                width: 100,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample'
            },
            {headerName: "CC Number",
                field: "ccNum",
                width: 50,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'idSample',
                hide: this.hideCCNum
            },
            {headerName: "# Seq Lanes",
                field: "numberSequencingLanes",
                width: 100,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
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
                fillGroupAttribute: 'idOrganism',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Multiplex Group required'}
                ],

            },
            {
                headerName: "Seq Lib Protocol",
                editable: false,
                width: 200,
                field: "idSeqLibProtocol",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.gnomexService.seqLibProtocolsWithAppFilters,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idSeqLibProtocol",

            },
            {
                headerName: "Index Tag A",
                editable: true,
                width: 125,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this.newExperimentService.barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ],
            },
            {headerName: "Index Tag Sequence A",
                field: "barcodeSequence",
                width: 100,
                editable: false,
            },
            {
                headerName: "Index Tag B",
                editable: true,
                width: 125,
                field: "idOligoBarcodeB",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this.newExperimentService.barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcodeB",
                indexTagLetter: 'B'
            },
            {headerName: "Index Tag Sequence B",
                field: "barcodeSequenceB",
                width: 100,
                editable: false,
            },

        ];
        this.form = this.fb.group({})

    }

    ngOnInit() {
        this.newExperimentService.numSamplesChanged.subscribe((value) =>{
            if (value && this.newExperimentService.samplesGridApi) {
                if (this.newExperimentService.numSamplesChanged.value === true) {
                    this.newExperimentService.numSamplesChanged.next(false);
                }
                if (this.newExperimentService.numSamples > 0) {
                    this.buildInitialRows();
                    this.newExperimentService.samplesGridApi.formGroup = this.form;
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
        this.newExperimentService.sampleTypeChanged.subscribe((value) => {
            if (value && this.newExperimentService.samplesGridApi) {
                this.changeSampleType();
                if (this.newExperimentService.sampleTypeChanged.value === true) {
                    this.newExperimentService.sampleTypeChanged.next(false);
                }
            }
        });
        this.newExperimentService.organismChanged.subscribe((value) => {
            if (value && this.newExperimentService.samplesGridApi) {
                this.changeOrganism();
                if (this.newExperimentService.organismChanged.value === true) {
                    this.newExperimentService.organismChanged.next(false);
                }
            }
        });
        this.newExperimentService.codeChanged.subscribe((value) => {
            if (value && this.newExperimentService.samplesGridApi) {
                this.changeCode();
                if (this.newExperimentService.codeChanged.value === true) {
                    this.newExperimentService.codeChanged.next(false);
                }
            }
        });
        this.newExperimentService.protoChanged.subscribe((value) => {
            if (value && this.newExperimentService.samplesGridApi) {
                this.updateRows();
                if (this.newExperimentService.protoChanged.value === true) {
                    this.newExperimentService.protoChanged.next(false);
                }
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

    ngAfterViewInit() {

    }

    changeOrganism() {
        if (this.newExperimentService.samplesGridApi) {
            this.newExperimentService.samplesGridApi.forEachNode((node: any) => {
                node.data.idOrganism = this.newExperimentService.organism.idOrganism;
            });
            this.newExperimentService.samplesGridApi.redrawRows();
            // if (!this.formControlSet) {
            //     setTimeout(() => {
            //         this.form.addControl("sample form", this.newExperimentService.samplesGridApi.formGroup);
            //         this.formControlSet = true;
            //     });
            // }
        }
        this.newExperimentService.sampleOrganisms.add(this.newExperimentService.organism);
    }

    changeCode() {
        if (this.newExperimentService.samplesGridApi) {
            let protocol = this.newExperimentService.codeApplication ? this.dictionaryService.getProtocolFromApplication(this.newExperimentService.codeApplication) : '';
            this.newExperimentService.samplesGridApi.forEachNode((node: any) => {
                node.data.idSeqLibProtocol = protocol.idSeqLibProtocol;
            });
            this.newExperimentService.samplesGridApi.redrawRows();
        }
    }

    updateRows() {
        let idSampleType: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.sampleType ?
            this.newExperimentService.sampleType.idSampleType :
            (this.newExperimentService.request.idSampleTypeDefault != null ? this.newExperimentService.request.idSampleTypeDefault : '');
        let idOrganism: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.organism ?
            this.newExperimentService.organism.idOrganism :
            (this.newExperimentService.request.idOrganismSampleDefault != null ? this.newExperimentService.request.idOrganismSampleDefault : '');
        let idNumberSequencingCycles: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
            this.newExperimentService.selectedProto.idNumberSequencingCycles : '';
        let idNumberSequencingCyclesAllowed: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
            this.newExperimentService.selectedProto.idNumberSequencingCyclesAllowed : '';
        let idSeqRunType: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
            this.newExperimentService.selectedProto.idSeqRunType : '';

        let protocol = this.newExperimentService.codeApplication ? this.dictionaryService.getProtocolFromApplication(this.newExperimentService.codeApplication) : '';
        let numberSequencingLanes: string = this.newExperimentService.request.isRapidMode === 'Y' ? '2' : '1';

        for (let sample of this.newExperimentService.samplesGridRowData) {
                sample.idNumberSequencingCycles = idNumberSequencingCycles,
                sample.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed,
                sample.idSeqRunType = idSeqRunType,
                sample.numberSequencingLanes = numberSequencingLanes,
                sample.idSampleType = idSampleType,
                sample.idSeqLibProtocol = protocol.idSeqLibProtocol,
                sample.idOrganism = idOrganism
        }

    }

    buildInitialRows() {

        if (this.newExperimentService.numSamples) {
            let isValid: boolean = true;
            let prepInstructions: string = '';

            let idSampleType: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.sampleType ?
                this.newExperimentService.sampleType.idSampleType :
                (this.newExperimentService.request.idSampleTypeDefault != null ? this.newExperimentService.request.idSampleTypeDefault : '');
            let idOrganism: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.organism ?
                this.newExperimentService.organism.idOrganism :
                (this.newExperimentService.request.idOrganismSampleDefault != null ? this.newExperimentService.request.idOrganismSampleDefault : '');
            let idNumberSequencingCycles: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
                this.newExperimentService.selectedProto.idNumberSequencingCycles : '';
            let idNumberSequencingCyclesAllowed: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
                this.newExperimentService.selectedProto.idNumberSequencingCyclesAllowed : '';
            let idSeqRunType: string = this.gnomexService.submitInternalExperiment() && this.newExperimentService.selectedProto ?
                this.newExperimentService.selectedProto.idSeqRunType : '';

            let protocol = this.newExperimentService.codeApplication ? this.dictionaryService.getProtocolFromApplication(this.newExperimentService.codeApplication) : '';
            let numberSequencingLanes: string = this.newExperimentService.request.isRapidMode === 'Y' ? '2' : '1';

            let index = this.newExperimentService.numSamples - this.newExperimentService.samplesGridRowData.length;

            if (index > 0) {
                for (let i = 0; i < index; i++) {
                    let obj = {
                        index: this.newExperimentService.samplesGridRowData.length + 1,
                        idSample: 'Sample' + this.getNextSampleId().toString(),
                        multiplexGroupNumber: "",
                        name: "",
                        canChangeSampleName: 'Y',
                        canChangeSampleType: 'Y',
                        canChangeSampleConcentration: 'Y',
                        canChangeSampleSource: 'Y',
                        canChangeNumberSequencingCycles: 'Y',
                        canChangeNumberSequencingLanes: 'Y',
                        concentration: "",
                        label: '',
                        idOligoBarcode: '',
                        barcodeSequence: '',
                        idOligoBarcodeB: '',
                        barcodeSequenceB: '',
                        idNumberSequencingCycles: idNumberSequencingCycles,
                        idNumberSequencingCyclesAllowed: idNumberSequencingCyclesAllowed,
                        idSeqRunType: idSeqRunType,
                        numberSequencingLanes: numberSequencingLanes,
                        idSampleType: idSampleType,
                        idSeqLibProtocol: protocol.idSeqLibProtocol,
                        seqPrepByCore: 'Y',
                        idOrganism: idOrganism,
                        prepInstructions: '',
                        otherOrganism: '',
                        treatment: ''

                    };
                    this.newExperimentService.samplesGridRowData.push(obj);
                }
            } else if (index < 0) {
                this.newExperimentService.samplesGridRowData.splice(-1, Math.abs(index));
            }
            // this.newExperimentService.sampleOrganisms.add(this.newExperimentService.organism);
            this.newExperimentService.samplesGridApi.setColumnDefs(this.newExperimentService.samplesGridColumnDefs);
            this.newExperimentService.samplesGridApi.setRowData(this.newExperimentService.samplesGridRowData);
            this.newExperimentService.samplesGridApi.sizeColumnsToFit();
            // this.newExperimentService.samplesChanged.next(true);
            this.newExperimentService.samplesView = this;
        }
    }

    protected getNextSampleId(): number {
        let lastId: number = -1;

        for (var sample of this.newExperimentService.samplesGridRowData) {
            if (sample.idSample.indexOf("Sample") === 0) {
                let id: number = sample.idSample.toString().substr(6);
                if (id > lastId) {
                    lastId = id;
                }
            }
        }

        lastId++;
        return lastId;
    }

    changeSampleType() {
        if (this.newExperimentService.samplesGridApi) {
            this.newExperimentService.samplesGridApi.forEachNode((node: any) => {
                node.data.idSampleType = this.newExperimentService.sampleType.idSampleType;
            });
            this.newExperimentService.samplesGridApi.redrawRows();
        }
    }

    toggleCC(event) {
        this.gridColumnApi.setColumnVisible("ccNum", event.checked);
    }

    onSamplesGridReady(params) {
        this.newExperimentService.samplesGridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.setHeaderHeight(50);
    }

    onSamplesGridRowDataChanged() {
    }

    onEverythingChanged(event) {
        // this.newExperimentService.samplesGridApi.sizeColumnsToFit();
        // this.newExperimentService.samplesGridApi.setRowData(this.newExperimentService.samplesGridRowData);
    }

    onSamplesGridRowSelected() {
    }

    onCellValueChanged(event) {
        if (event.colDef.headerName === "Organism") {
            let organism = this.organisms.filter(org => org.idOrganism === event.data.idOrganism);
            if (organism) {
                this.newExperimentService.sampleOrganisms.add(organism[0]);
                this.newExperimentService.samplesChanged.next(true);
            }
        } else if (event.colDef.headerName === "Index Tag A") {
            let barcode = this.newExperimentService.barCodes.filter(barcode => barcode.idOligoBarcode === event.data.idOligoBarcode);
            if (barcode) {
                this.newExperimentService.samplesGridRowData[event.rowIndex].barcodeSequence = barcode[0].barcodeSequence;
                this.newExperimentService.samplesGridApi.redrawRows();
            }
        } else if (event.colDef.headerName === "Index Tag B") {
            let barcode = this.newExperimentService.barCodes.filter(barcode => barcode.idOligoBarcodeB === event.data.idOligoBarcodeB);
            if (barcode) {
                this.newExperimentService.samplesGridRowData[event.rowIndex].barcodeSequenceB = barcode[0].barcodeSequenceB;
                this.newExperimentService.samplesGridApi.redrawRows();
            }
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
