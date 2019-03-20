import {Component, Inject, ViewChild} from "@angular/core";
import {LabListService} from "../services/lab-list.service";
import {DOCUMENT} from "@angular/common";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {jqxComboBoxComponent} from "../../assets/jqwidgets-ts/angular_jqxcombobox";
import {DictionaryService} from "../services/dictionary.service";
import {AnnotationService} from "../services/annotation.service";
import {UserPreferencesService} from "../services/user-preferences.service";

@Component({
    selector: 'annotation-report',
    templateUrl: "./annotation-report.component.html",
})

export class AnnotationReportComponent {
    public readonly FOR_SAMPLES: string = "SAMPLE";
    public readonly FOR_ANALYSES: string = "ANALYSIS";
    public readonly FOR_DATA_TRACKS: string = "DATATRACK";

    @ViewChild('requestCategoryCombo') requestCategoryCombo: jqxComboBoxComponent;

    public coreList: any[] = [];
    private idCoreFacility: string = "";
    public labList: any[] = [];
    private idLab: string = "";
    public annotationsFor: string = this.FOR_SAMPLES;
    private requestCategoryMasterList: any[] = [];
    public requestCategoryList: any[] = [];
    private codeRequestCategories: Set<string> = new Set<string>();
    public dateFromString: string = "";
    public dateToString: string = "";

    private allProperties: any[];
    public annotationColumnDefs: any[];
    public annotationRowData: any[];
    private annotationGridApi: any;
    public customColumnsColumnDefs: any[];
    public customColumnsRowData: any[];
    private customColumnsGridApi: any;

    constructor(private labListService: LabListService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                private annotationService: AnnotationService,
                public prefService: UserPreferencesService,
                @Inject(DOCUMENT) private document: Document) {

        this.coreList = this.createSecurityAdvisorService.myCoreFacilities;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
        this.requestCategoryMasterList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY).filter( (cat: any) => {
            return cat.isActive === "Y" && !(cat.value === "");
        });
        this.filterRequestCategories();

        this.annotationColumnDefs = [
            {headerName: "Annotation", field: "name", checkboxSelection: true, headerCheckboxSelection: true, width: 530},
        ];
        this.annotationService.getPropertyList().subscribe((response: any[]) => {
            this.allProperties = response;
            this.refreshAnnotationList();
        });

        this.customColumnsColumnDefs = [
            {headerName: "Custom Columns", field: "display", checkboxSelection: true, headerCheckboxSelection: true, width: 530},
        ];
        this.customColumnsRowData = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANNOTATION_REPORT_FIELD).filter((field: any) => {
           return !(field.value === "");
        });
    }

    public onAnnotationGridReady(params: any): void {
        this.annotationGridApi = params.api;
    }

    public onCustomColumnsGridReady(params: any): void {
        this.customColumnsGridApi = params.api;
    }

    public onAnnotationGridRowDataChanged(params: any): void {
        this.annotationGridApi.forEachNode((node: any, index: number) => {
            if (node.data.isRequired === "Y") {
                node.setSelected(true);
            }
        });
    }

    private refreshAnnotationList(): void {
        if (this.idCoreFacility === "") {
            this.annotationRowData = [];
        } else {
            this.annotationRowData = this.allProperties.filter((prop: any) => {
                let keep: boolean = false;

                if (prop.name === "Other") {
                    keep = false;
                } else if (this.annotationsFor === this.FOR_SAMPLES && prop.forSample === "Y") {
                    keep = true;
                } else if (this.annotationsFor === this.FOR_ANALYSES && prop.forAnalysis === "Y") {
                    keep = true;
                } else if (this.annotationsFor === this.FOR_DATA_TRACKS && prop.forDataTrack === "Y") {
                    keep = true;
                }

                if (keep) {
                    if (!(this.idCoreFacility === prop.idCoreFacility)) {
                        keep = false;
                    }
                }

                return keep;
            });
        }
    }

    private filterRequestCategories(): void {
        this.requestCategoryList = this.requestCategoryMasterList.filter( (cat: any) => {
            if (!(this.idCoreFacility === "")) {
                return cat.idCoreFacility === this.idCoreFacility;
            } else {
                return this.createSecurityAdvisorService.isCoreFacilityIManage(cat.idCoreFacility);
            }
        });
    }

    public onCoreSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idCoreFacility = event.args.item.value;
                this.updateRequestCategoriesOnCoreChange();
                this.refreshAnnotationList();
            }
        } else {
            this.onCoreUnselect();
        }
    }

    public onCoreUnselect(): void {
        this.idCoreFacility = "";
        this.updateRequestCategoriesOnCoreChange();
        this.refreshAnnotationList();
    }

    private updateRequestCategoriesOnCoreChange(): void {
        this.codeRequestCategories.clear();
        if (this.annotationsFor === this.FOR_SAMPLES) {
            this.requestCategoryCombo.clear();
        }
        this.filterRequestCategories();
    }

    public onLabSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idLab = event.args.item.value;
            }
        } else {
            this.onLabUnselect();
        }
    }

    public onLabUnselect(): void {
        this.idLab = "";
    }

    public onAnnotationsForRadioChange(): void {
        if (!(this.annotationsFor === this.FOR_SAMPLES)) {
            this.codeRequestCategories.clear();
            this.dateFromString = "";
            this.dateToString = "";
        }

        this.refreshAnnotationList();
    }

    public onRequestCategorySelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.codeRequestCategories.add(event.args.item.value);
            }
        }
    }

    public onRequestCategoryUnselect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.codeRequestCategories.delete(event.args.item.value);
            }
        }
    }

    public run(): void {
        let selectedAnnotations: any[] = this.annotationGridApi.getSelectedRows();
        let idPropertiesString: string = "";
        selectedAnnotations.forEach((annotation: any) => {
            if (idPropertiesString === "") {
                idPropertiesString = idPropertiesString.concat(annotation.idProperty);
            } else {
                idPropertiesString = idPropertiesString.concat(",", annotation.idProperty);
            }
        }, this);

        let codeRequestCategoriesString: string = "";
        this.codeRequestCategories.forEach((codeRequestCategory: string) => {
            if (codeRequestCategoriesString === "") {
                codeRequestCategoriesString = codeRequestCategoriesString.concat(codeRequestCategory);
            } else {
                codeRequestCategoriesString = codeRequestCategoriesString.concat(",", codeRequestCategory);
            }
        }, this);

        let selectedCustomColumns: any[] = this.customColumnsGridApi.getSelectedRows();
        let customColumnString: string = "";
        selectedCustomColumns.forEach((customColumn: any) => {
            if (customColumnString === "") {
                customColumnString = customColumnString.concat(customColumn.idAnnotationReportField);
            } else {
                customColumnString = customColumnString.concat(",", customColumn.idAnnotationReportField);
            }
        }, this);

        let url: string = this.document.location.href;
        url += "/ShowAnnotationReport.gx?idLab=" + this.idLab;
        url += "&idCoreFacility=" + this.idCoreFacility;
        url += "&target=" + this.annotationsFor;
        url += "&idProperties=" + idPropertiesString;
        url += "&codeRequestCategories=" + codeRequestCategoriesString;
        url += "&customColumnString=" + customColumnString;
        url += "&createDateFrom=" + this.dateFromString;
        url += "&createDateTo=" + this.dateToString;
        window.open(url, "_blank");
    }

}
