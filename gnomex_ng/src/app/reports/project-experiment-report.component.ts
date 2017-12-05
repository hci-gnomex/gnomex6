import {Component, Inject} from "@angular/core";
import {LabListService} from "../services/lab-list.service";
import {DOCUMENT} from "@angular/common";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'project-experiment-report',
    templateUrl: "./project-experiment-report.component.html",
})

export class ProjectExperimentReportComponent {

    private _isAdmin: boolean = false;
    public get isAdmin(): boolean {
        return this._isAdmin;
    }

    public coreList: any[] = [];
    private idCoreFacility: string = "";

    public labList: any[] = [];
    private idLab: string = "";

    constructor(private labListService: LabListService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                @Inject(DOCUMENT) private document: Document) {
        this.coreList = this.createSecurityAdvisorService.myCoreFacilities;
        this._isAdmin = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    public onCoreSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idCoreFacility = event.args.item.value;
            }
        } else {
            this.onCoreUnselect();
        }
    }

    public onCoreUnselect(): void {
        this.idCoreFacility = "";
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

    public run(): void {
        let url: string = this.document.location.href;
        url += "/ShowProjectExperimentReport.gx?idLab=" + this.idLab;
        url += "&idCoreFacility=" + this.idCoreFacility;
        window.open(url, "_blank");
    }

}
