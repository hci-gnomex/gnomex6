import {Component} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {PropertyService} from "../services/property.service";
import {ActivatedRoute, Params} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'configure-annotations',
    templateUrl: "./configure-annotations.component.html",
})

export class ConfigureAnnotationsComponent {
    public readonly TYPE_SAMPLES: string = "s";
    public readonly TYPE_ANALYSIS: string = "a";
    public readonly TYPE_DATA_TRACKS: string = "dt";
    public readonly TYPE_EXPERIMENTS: string = "e";

    public type: string = "";
    public listOrganism: any[] = [];
    public idOrganism: string;
    public listExperimentPlatform: any[] = [];
    public codeRequestCategory: string;
    public listAnalysisType: any[] = [];
    public idAnalysisType: string;
    public allProps: any[] = [];
    private idCoreFacility: string = null;
    public myCoreFacilities: any[] = [];

    public annotGridColumnDefs: any[];
    public annotGridRowData: any[];
    private annotGridApi: any;

    constructor(private dictionaryService: DictionaryService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {
        this.annotGridColumnDefs = [
            {headerName: "Annotation", field: "name", width: 100},
        ];
        this.annotGridRowData = [];

        route.params.subscribe((params: Params) => {
            if (params && params["idCoreFacility"]) {
                this.idCoreFacility = params["idCoreFacility"];
            }
        });
        this.myCoreFacilities = this.createSecurityAdvisorService.myCoreFacilities;
        this.listOrganism = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.listExperimentPlatform = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.listAnalysisType = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.propertyService.getPropertyList(true).subscribe((response: any[]) => {
            this.allProps = response;
            this.updateDisplayedProperties();
        });
    }

    private updateDisplayedProperties(): void {
        this.annotGridRowData = this.allProps.filter((prop: any) => {
            let coreMatch: boolean = false;
            if (this.idCoreFacility && this.idCoreFacility === prop.idCoreFacility) {
                coreMatch = true;
            } else {
                for (let core of this.myCoreFacilities) {
                    if (prop.idCoreFacility === core.idCoreFacility) {
                        coreMatch = true;
                        break;
                    }
                }
            }
            if (!coreMatch) {
                return false;
            }

            let criteriaMatch: boolean = false;
            if (this.type === "") {
                criteriaMatch = true;
            } else if (this.type === this.TYPE_SAMPLES && prop.forSample === "Y") {
                criteriaMatch = true;
            } else if (this.type === this.TYPE_ANALYSIS && prop.forAnalysis === "Y") {
                criteriaMatch = true;
            } else if (this.type === this.TYPE_DATA_TRACKS && prop.forDataTrack === "Y") {
                criteriaMatch = true;
            } else if (this.type === this.TYPE_EXPERIMENTS && prop.forRequest === "Y") {
                criteriaMatch = true;
            }
            if (!criteriaMatch) {
                return false;
            }

            if (this.idOrganism && this.idOrganism != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.idOrganism, prop.appliesToOrganism)) {
                return false;
            }
            if (this.idAnalysisType && this.idAnalysisType != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.idAnalysisType, prop.appliesToAnalysis)) {
                return false;
            }
            if (this.codeRequestCategory && this.codeRequestCategory != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.codeRequestCategory, prop.appliesToRequestCategory)) {
                return false;
            }

            return true;
        });
    }

    private static hasMatchInList(value: string, listArrayString: string): boolean {
        if (value && listArrayString) {
            let listArray: string[] = listArrayString.split(", ");
            for (let item of listArray) {
                if (item === value) {
                    return true;
                }
            }
        }
        return false;
    }

    public onAnnotGridReady(params: any): void {
        this.annotGridApi = params.api;
        this.annotGridApi.sizeColumnsToFit();
    }

    public onAnnotGridRowDataChanged(): void {
        // TODO
    }

    public onAnnotGridRowSelected(event: any): void {
        // TODO
    }

    public add(): void {
        // TODO
    }

    public deleteAnnotation(): void {
        // TODO
    }

    public refresh(): void {
        // TODO
    }

    public onCriteriaChange(): void {
        this.updateDisplayedProperties();
    }

}