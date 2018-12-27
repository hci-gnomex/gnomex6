import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GnomexService} from "../../services/gnomex.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {BarcodeSelectEditor} from "../../util/grid-editors/barcode-select.editor";
import {BillingService} from "../../services/billing.service";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: "tabConfirmIllumina",
    templateUrl: "./tab-confirm-illumina.component.html",
    styles: [`
        
        
        .confirm-instructions {
            background-color: lightyellow;
            width: 25%;
            font-size: 80%;
        }
        
        
    `]
})

export class TabConfirmIlluminaComponent implements OnInit {

    public get showAgreeBox(): boolean {
        return true;
    }

    private form: FormGroup;
    private submitterName: string;
    private labName: string;
    private billingAccountName: string;
    private billingAccountNumber: string;
    private preppedByClient: boolean = false;
    private clientPrepString: string = "Library Prepared By Client";
    private clientPrepLib: boolean;
    private seqLaneTypeLabel: string;
    private requestPropsGridApi: any;
    private requestPropsColumnApi: any;
    private samplesGridConfirmColumnDefs: any;
    private requestPropsColumnDefs: any;
    private organisms: any[] = [];
    private isCheckboxChecked: boolean;
    private agreeCheckbox: boolean;
    private agreeCheckboxLabel: string;
    private requestPropBox: boolean;
    private billingItems: any[] = [];

    public protocolName: string;

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                private securityAdvisor: CreateSecurityAdvisorService,
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
                selectOptions: this.newExperimentService.barCodes,
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
                selectOptions: this.newExperimentService.barCodes,
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
                selectOptions: this.newExperimentService.sampleTypes,
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
        this.newExperimentService.ownerChanged.subscribe((value) => {
            if (this.newExperimentService.ownerChanged.value === true) {
                this.newExperimentService.ownerChanged.next(false);
            }
        });
        this.newExperimentService.labChanged.subscribe((value) => {
            if (this.newExperimentService.labChanged.value === true) {
                this.newExperimentService.labChanged.next(false);
                if (this.newExperimentService.lab) {
                    this.labName = this.newExperimentService.lab.nameFirstLast;
                }
            }
        });
        this.newExperimentService.protoChanged.subscribe((value) => {
            if (this.newExperimentService.protoChanged.value === true) {
                this.newExperimentService.protoChanged.next(false);
                if (this.newExperimentService.selectedProto) {
                    this.protocolName = this.newExperimentService.selectedProto.display;
                }
            }
        });
        this.newExperimentService.preppedChanged.subscribe((value) => {
            if (this.newExperimentService.preppedChanged.value === true) {
                this.newExperimentService.preppedChanged.next(false);
                this.preppedByClient = this.newExperimentService.preppedByClient;
                this.setClientPrepString();
            }
        });
        this.newExperimentService.onConfirmTab.subscribe((value) => {
            if (this.newExperimentService.onConfirmTab.value === true) {
                this.newExperimentService.onConfirmTab.next(false);
                this.setUpView();
            }
        });
        this.newExperimentService.accountChanged.subscribe((value) => {
            if (this.newExperimentService.accountChanged.value === true) {
                this.newExperimentService.accountChanged.next(false);
                if (this.newExperimentService.billingAccount) {
                    this.billingAccountName = this.newExperimentService.billingAccount.accountName;
                    this.billingAccountNumber = this.newExperimentService.billingAccount.accountNumber;
                }
            }
        });

        this.form = this.fb.group({});
    }

    setUpView() {
        this.newExperimentService.checkSamplesCompleteness();
        this.newExperimentService.updateRequestProperties();
        this.getEstimatedBilling();
        //this.newExperimentService.getMultiplexLanes();
        this.submitterName = this.newExperimentService.getSubmitterName();
        this.clientPrepLib = false;
        for (let s1 of this.newExperimentService.samplesGridRowData) {
            let nsca: any = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(nsca2 =>
                nsca2.value != "" && nsca2.idSampleType === s1.idNumberSequencingCyclesAllowed
            );

            this.seqLaneTypeLabel = nsca.display;

            if (s1.seqPrepByCore === 'N') {
                this.clientPrepLib = true;

                this.clientPrepString = "Library Prepared By Client";
                if (this.newExperimentService.request.hasPrePooledLibraries === 'Y' && this.newExperimentService.request.numPrePooledTubes != null && this.newExperimentService.request.numPrePooledTubes != '') {
                    this.clientPrepString += ", " + this.newExperimentService.request.numPrePooledTubes + " Pre-Pooled Tubes";
                }
            }
            break;
        }

        this.requestPropBox = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.request.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_PROPS_ON_CONFIRM_TAB) === 'Y';
    }

    onGridReady(params: any) {
        this.requestPropsGridApi = params.api;
        this.requestPropsColumnApi = params.columnApi;
    }

    setClientPrepString() {
        if (this.preppedByClient) {

        }
    }

    public getEstimatedBilling(): void {
        this.newExperimentService.initializeRequest();
        this.agreeCheckbox = false;
        this.agreeCheckboxLabel = "";
        this.isCheckboxChecked = false;

        if (this.newExperimentService.request.isExternal == 'Y') {
            // This is an external experiment submission.  Don't
            // attempt to get estimated charges.

            // this.newExperimentService.hideSubmit = false;
        } else {

            var accountName:String = "";
            if (this.newExperimentService.billingAccount != null) {
                accountName = this.newExperimentService.billingAccount.accountNumberDisplay;
            }
            // else if (this.newExperimentService.selectedBillingTemplate != null) {
            //     var template: any = this.newExperimentService.setupView.selectedBillingTemplate;
            //     var items: any[] = template.BillingTemplateItem;
            //     var firstAccount: boolean = true;
            //     for (var item of items) {
            //         if (firstAccount) {
            //             accountName = item.accountNumberDisplay;
            //             firstAccount = false;
            //         } else {
            //             accountName += ", " + item.accountNumberDisplay;
            //         }
            //     }
            // }

            this.agreeCheckboxLabel = "I authorize all charges to be billed to account(s): " + accountName;

            // This is a new experiment request. Get the estimated charges for this request.
            // this.newExperimentService.request.PropertyEntries=[];
            this.newExperimentService.request.billingItems = [];
            let stringifiedRequest: any = JSON.stringify(this.newExperimentService.request);
            // let params: HttpParams = new HttpParams()
            //     .set("requestXMLString", stringifiedRequest);
            let formData: FormData = new FormData();
            formData.append("requestXMLString", stringifiedRequest);
            this.billingService.createBillingItems2(stringifiedRequest).subscribe((response: any) => {
                this.billingItems = response.BillingItem;
            })
        }

    }

}
