import {Component, Inject} from "@angular/core";
import {LabListService} from "../services/lab-list.service";
import {DOCUMENT} from "@angular/common";
import {UserPreferencesService} from "../services/user-preferences.service";

@Component({
    selector: 'annotation-progress-report',
    templateUrl: "./annotation-progress-report.component.html",
})

export class AnnotationProgressReportComponent {

    public labList: any[] = [];
    private idLab: string = "";

    constructor(private labListService: LabListService,
                public prefService: UserPreferencesService,
                @Inject(DOCUMENT) private document: Document) {
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    public onLabSelect(event: any): void {
        if (event) {
            this.idLab = event;
        } else {
            this.idLab = "";
        }
    }

    public run(): void {
        let url: string = this.document.location.href;
        url += "/ShowAnnotationProgressReport.gx?idLab=" + this.idLab;
        window.open(url, "_blank");
    }

}
