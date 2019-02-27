import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {BillingService} from "../../services/billing.service";

import {Experiment} from "../../util/models/experiment.model";
import {BehaviorSubject, Subscription} from "rxjs/index";
import {ExperimentsService} from "../experiments.service";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {AnnotationService} from "../../services/annotation.service";
import {TabSampleSetupViewComponent} from "./tab-sample-setup-view.component";

@Component({
    selector: "tabConfirmIllumina",
    templateUrl: "./tab-confirm-illumina.component.html",
    styles: [`
        

        .no-height { height: 0;  }
        .single-em { width: 1em; }
        
        .bordered { border: solid silver 1px; }
        
        .heavily-left-padded { padding-left: 1.5em; }
        .heavily-right-padded { padding-right: 1.5em; }
        
        
        .wide-display { 
            min-width: 30em; 
            width: 30%; 
        }
        
        
        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }
        
        .right-align { text-align: right; }
        
        
        .top-margin { margin-top: 0.3em; }
        
        .minimal { width: fit-content; }
        
        .instructions-background {
            background-color: lightyellow;
        }
        
        .minheight { min-height: 3em; }
        
        .font-bold { font-weight: bold; }
        
        
    `]
})

export class TabConfirmIlluminaComponent implements OnInit, OnDestroy {

    @Input("experiment") public set experiment(value: Experiment) {
        this._experiment = value;
    }

    @Input("getExperimentAnnotationsSubject") public set getExperimentAnnotationsSubject(subject: BehaviorSubject<any>) {
        this._getExperimentAnnotationsSubject = subject;
    }
    @Input("experimentAnnotations") public set experimentAnnotations(subject: BehaviorSubject<any[]>) {
        if (!this.experimentAnnotationsSubscription && subject) {
            this.experimentAnnotationsSubscription = subject.asObservable().subscribe((value: any[]) => {
                this._experimentAnnotations = value;
            });
        }
    }

    @Input("agreeCheckboxLabelSubject") set agreeCheckboxLabelSubject(subject: BehaviorSubject<string>) {
        this.agreeCheckboxLabel_subject = subject;
    }


    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public get experiment(): Experiment {
        return this._experiment;
    }

    private _experiment: Experiment;
    public  _experimentAnnotations: any[];

    private _getExperimentAnnotationsSubject: BehaviorSubject<any>;

    private agreeCheckboxLabel_subject: BehaviorSubject<string>;

    private form: FormGroup;
    private submitterName: string;

    private clientPrepString: string = "Library Prepared By Client";
    private clientPrepLib: boolean;
    private seqLaneTypeLabel: string;
    private gridApi: any;
    private columnApi: any;
    private samplesGridConfirmColumnDefs: any;
    private requestPropsColumnDefs: any;
    private organisms: any[] = [];

    private isCheckboxChecked: boolean;
    private disable_agreeCheckbox: boolean;

    private requestPropBox: boolean;
    public billingItems: any[] = [];

    private _barCodes: any[] = [];

    private sampleTypes: any[] = [];

    private experimentAnnotationsSubscription: Subscription;


    public totalEstimatedCharges: String = '$-.--';

    private tabIndexToInsertAnnotations: number;

    private emToPxConversionRate: number = 13;

    private propertyList: any[];
    private sequenceLanes: any[];


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



    constructor(private annotationService: AnnotationService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
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

        this.annotationService.getPropertyList().subscribe((result) => {
            this.propertyList = result;
            this.buildColumnDefinitions();
        });

        this.organisms = this.dictionaryService.getEntries("hci.gnomex.model.OrganismLite");
    }

    ngOnInit() {
        this.loadBarcodes();
        this.loadSampleTypes();

        this.form = this.fb.group({});
    }

    ngOnDestroy() {
        if (this.experimentAnnotationsSubscription) {
            this.experimentAnnotationsSubscription.unsubscribe();
        }
    }

    private buildColumnDefinitions(): void {
        let temp: any[] = [];

        temp.push({
            headerName: "Multiplex Group #",
            editable: false,
            field: "multiplexGroupNumber",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width: 100
        });
        temp.push({
            headerName: "Sample ID",
            field: "sampleId",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width: 100,
            editable: false
        });
        temp.push({
            headerName: "Sample Name",
            field: "name",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width: 100,
            editable: false
        });
        temp.push({
            headerName: "Conc. (ng/ul)",
            field: "concentration",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            width: 100,
            editable: false
        });
        temp.push({
            headerName: "Sample Volume (ul)",
            field: "sampleVolume",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            width: 100,
            editable: false
        });

        this.tabIndexToInsertAnnotations = temp.length;

        temp.push({
            headerName: "# Seq Lanes",
            field: "numberSequencingLanes",
            width: 100,
            editable: false
        });
        temp.push({
            headerName: "Sample Type",
            editable: false,
            width: 175,
            field: "idSampleType",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.sampleTypes,
            selectOptionsDisplayField: "sampleType",
            selectOptionsValueField: "idSampleType"
        });
        temp.push({
            headerName: "Organism",
            editable: false,
            width: 200,
            field: "idOrganism",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.organisms,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOrganism"
        });

        if (this._experiment) {
            for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                let fullProperty = this.propertyList.filter((value: any) => {
                    return value.idProperty === sampleAnnotation.idProperty;
                });

                if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                    TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], this.tabIndexToInsertAnnotations, this.emToPxConversionRate);
                }
            }
        }

        this.samplesGridConfirmColumnDefs = temp;
    }

    public tabDisplayed(): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this._getExperimentAnnotationsSubject.next({});
        this.setUpView();

        this.gridApi.setColumnDefs(this.samplesGridConfirmColumnDefs);
        this.gridApi.setRowData(this.sequenceLanes);
        this.gridApi.sizeColumnsToFit();
    }

    private loadBarcodes(): void {
        this._barCodes = [];

        let allBarcodes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of allBarcodes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
        }
    }

    private setUpView() {
        this.getEstimatedBilling();
        this.getSequenceLanes();

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

    private getEstimatedBilling(): void {
        this.disable_agreeCheckbox = true;
        this.isCheckboxChecked = false;

        if (this._experiment.isExternal === 'Y') {
            // This is an external experiment submission.  Don't attempt to get estimated charges.
        } else {
            let accountName:String = "";

            if (this._experiment.billingAccount != null) {
                accountName = this._experiment.billingAccount.accountNumberDisplay;
            }

            this.agreeCheckboxLabel_subject.next("I authorize all charges to be billed to account(s): " + accountName);
            this.disable_agreeCheckbox = false;

            // This is a new experiment request. Get the estimated charges for this request.

            let propertiesXML = JSON.stringify(this._experimentAnnotations);
            this.billingService.createBillingItems(propertiesXML, this._experiment).subscribe((response: any) => {

                if (!response || !response.Request) {
                    return;
                }

                if (response.Request.invoicePrice && ('' + response.Request.invoicePrice).match(/^.\d+\.\d{2}$/)) {
                    this.totalEstimatedCharges = response.Request.invoicePrice;
                }

                this.billingItems = [];

                if (response.Request.BillingItem && Array.isArray(response.Request.BillingItem)) {
                    this.billingItems = response.Request.BillingItem
                } else {
                    this.billingItems = [response.Request.BillingItem.BillingItem];
                }
            });
        }
    }

    private getSequenceLanes(): void {

        this.experimentService.getMultiplexLaneList(this._experiment).subscribe((response: any) => {
            if (!response || !(Array.isArray(response) || response.MultiplexLane)) {
                return;
            }

            let multiplexLanes: any[] = [];

            if (Array.isArray(response)) {
                multiplexLanes = response;
            } else {
                multiplexLanes = [response.MultiplexLane];
            }

            let sequenceLanes = [];

            for (let sample of this._experiment.samples) {
                sequenceLanes.push(sample.getJSONObjectRepresentation());
            }

            let sampleNumber: number = 0;

            for (let multiplexLane of multiplexLanes) {
                let multiplexNumber = multiplexLane.number;

                if (multiplexLane.SequenceLane) {
                    if (Array.isArray(multiplexLane.SequenceLane)) {
                        for (let lane of multiplexLane.SequenceLane) {
                            sequenceLanes[sampleNumber].sampleId = 'X' + ++sampleNumber;
                        }
                    } else {
                        sequenceLanes[sampleNumber].sampleId        = 'X' + ++sampleNumber;
                    }
                }
            }

            this.sequenceLanes = sequenceLanes;
            this.gridApi.setRowData(this.sequenceLanes);
        });
    }

    private loadSampleTypes(): void {
        let types: any[] = [];

        for (let sampleType of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleType")) {
            if (sampleType.isActive === 'N'
                || (sampleType.codeNucleotideType !== "RNA" && sampleType.codeNucleotideType !== "DNA")) {

                continue;
            }

            let requestCategories = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleTypeRequestCategory").filter(sampleRequestCategory =>
                sampleRequestCategory.value !== "" && sampleRequestCategory.idSampleType === sampleType.value
            );

            for (let requestCategory of requestCategories) {
                if (this._experiment && requestCategory.codeRequestCategory === this._experiment.codeRequestCategory) {
                    types.push(sampleType);
                }
            }
        }

        this.sampleTypes = types.sort(TabSampleSetupViewComponent.sortSampleTypes);
    }

    public onGridReady(params: any): void {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.gridApi.setColumnDefs(this.samplesGridConfirmColumnDefs);
        this.gridApi.setRowData(this.sequenceLanes);
        this.gridApi.sizeColumnsToFit();
    }
}
