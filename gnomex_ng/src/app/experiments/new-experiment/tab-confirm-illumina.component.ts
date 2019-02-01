import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {BarcodeSelectEditor} from "../../util/grid-editors/barcode-select.editor";
import {BillingService} from "../../services/billing.service";

import {Experiment} from "../../util/models/experiment.model";
import {URLSearchParams} from "@angular/http";

@Component({
    selector: "tabConfirmIllumina",
    templateUrl: "./tab-confirm-illumina.component.html",
    styles: [`
        
        
        .bordered { border: solid silver 1px; }
        
        .heavily-left-padded { padding-left: 1.5em; }
        
        
        .top-margin { margin-top: 0.3em; }
        
        .minimal { width: fit-content; }
        
        .instructions-background {
            background-color: lightyellow;
        }
        
        .minheight { min-height: 3em; }
        
        .font-bold { font-weight: bold; }
        
        
    `]
})

export class TabConfirmIlluminaComponent implements OnInit {

    @Input("experiment") public set experiment(value: Experiment) {
        this._experiment = value;
    }
    public get experiment(): Experiment {
        return this._experiment;
    }

    private _experiment: Experiment;

    private form: FormGroup;
    private submitterName: string;

    private clientPrepString: string = "Library Prepared By Client";
    private clientPrepLib: boolean;
    private seqLaneTypeLabel: string;
    private requestPropsGridApi: any;
    private requestPropsColumnApi: any;
    private samplesGridConfirmColumnDefs: any;
    private requestPropsColumnDefs: any;
    private organisms: any[] = [];

    private isCheckboxChecked: boolean;
    private disable_agreeCheckbox: boolean;

    private requestPropBox: boolean;
    private billingItems: any[] = [];

    public agreeCheckboxLabel: string;

    private _barCodes: any[] = [];

    private sampleTypes: any[] = [];


    public get labName(): string {
        if (this._experiment && this._experiment._labName_notReturned) {
            return this._experiment._labName_notReturned;
        } else {
            return '';
        }
    }



    public get billingAccountName(): string {
        return this._experiment.billingAccountName;
    }
    public set billingAccountName(value: string) {
        this._experiment.billingAccountName = value;
    }

    public get billingAccountNumber(): string {
        return this._experiment.billingAccountNumber;
    }
    public set billingAccountNumber(value: string) {
        this._experiment.billingAccountNumber = value;
    }



    constructor(private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private billingService: BillingService,
                private fb: FormBuilder) {

        this.requestPropsColumnDefs = [
            {
                headerName: "",
                field: "name",
                width: 100,
            },
            {
                headerName: "",
                field: "value",
                width: 100,
            }
        ];
        this.samplesGridConfirmColumnDefs = [
            {
                headerName: "Multiplex Group",
                editable: false,
                field: "multiplexGroupNumber",
                width: 100
            },
            {
                headerName: "Sample Name",
                field: "name",
                width: 100,
                editable: false
            },
            {
                headerName: "Conc. (ng/ul)",
                field: "concentration",
                width: 100,
                editable: false
            },
            {
                headerName: "Vol. (ul)",
                field: "sampleVolumne",
                width: 100,
                editable: false
            },
            {
                headerName: "Index Tag A",
                editable: false,
                width: 125,
                field: "idOligoBarcode"
            },
            {
                headerName: "Index Tag B",
                editable: false,
                width: 125,
                field: "idOligoBarcodeB",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcodeB",
                indexTagLetter: 'B'
            },
            {
                headerName: "Index Tag",
                editable: false,
                width: 125,
                field: "idOligoBarcodeB",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcodeB",
                indexTagLetter: 'B'
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
                selectOptionsValueField: "idSeqLibProtocol"
            },
            {
                headerName: "# Seq Lanes",
                field: "numberSequencingLanes",
                width: 100,
                editable: false
            },
            {
                headerName: "Sample Type",
                editable: false,
                width: 175,
                field: "idSampleType",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.sampleTypes,
                selectOptionsDisplayField: "sampleType",
                selectOptionsValueField: "idSampleType"
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
                selectOptionsValueField: "idOrganism"
            }
        ];

        this.organisms = this.dictionaryService.getEntries("hci.gnomex.model.OrganismLite");
    }

    ngOnInit() {
        this.loadBarcodes();

        this.form = this.fb.group({});
    }

    public tabDisplayed(): void {
        this.setUpView();
    }

    private loadBarcodes(): void {
        this._barCodes = [];

        let allBarcodes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of allBarcodes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
        }
    }

    setUpView() {
        this.getEstimatedBilling();
        this.submitterName = '';
        if (this._experiment && this._experiment.experimentOwner && this._experiment.experimentOwner.displayName) {
            this.submitterName = this._experiment.experimentOwner.displayName;
        }

        this.clientPrepLib = false;

        if (this._experiment.samples
            && Array.isArray(this._experiment.samples)
            && this._experiment.samples.length > 0) {

            let s1 = this._experiment.samples[0];

            let nsca: any = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(nsca2 =>
                nsca2.value != "" && nsca2.idSampleType === s1.idNumberSequencingCyclesAllowed
            );

            this.seqLaneTypeLabel = nsca.display;

            if (s1.seqPrepByCore === 'N') {
                this.clientPrepLib = true;

                this.clientPrepString = "Library Prepared By Client";
                if (this._experiment.hasPrePooledLibraries === 'Y' && this._experiment.numPrePooledTubes != null && this._experiment.numPrePooledTubes != '') {
                    this.clientPrepString += ", " + this._experiment.numPrePooledTubes + " Pre-Pooled Tubes";
                }
            }
        }

        this.requestPropBox = this.gnomexService.getCoreFacilityProperty(this._experiment.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_PROPS_ON_CONFIRM_TAB) === 'Y';
    }

    public getEstimatedBilling(): void {
        this.disable_agreeCheckbox = true;
        this.agreeCheckboxLabel = "";
        this.isCheckboxChecked = false;

        if (this._experiment.isExternal === 'Y') {
            // This is an external experiment submission.  Don't attempt to get estimated charges.
        } else {
            let accountName:String = "";

            if (this._experiment.billingAccount != null) {
                accountName = this._experiment.billingAccount.accountNumberDisplay;
            }

            this.agreeCheckboxLabel = "I authorize all charges to be billed to account(s): " + accountName;
            this.disable_agreeCheckbox = false;

            // This is a new experiment request. Get the estimated charges for this request.
            this._experiment.billingItems = [];

            let stringifiedRequest: string = JSON.stringify(this._experiment.getJSONObjectRepresentation());
            // let formData: FormData = new FormData();
            // formData.append("requestXMLString", stringifiedRequest);
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestXMLString", stringifiedRequest);
            this.billingService.createBillingItems2(params).subscribe((response: any) => {
                this.billingItems = response.BillingItem;
            });
        }
    }

    public onGridReady(params: any): void {
        this.requestPropsGridApi = params.api;
        this.requestPropsColumnApi = params.columnApi;
    }
}
