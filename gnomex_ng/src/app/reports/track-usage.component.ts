import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UsageService} from "../services/usage.service";
import {Observable} from "rxjs/Observable";
import {URLSearchParams} from "@angular/http";

@Component({
    selector: 'track-usage',
    templateUrl: "./track-usage.component.html",
})

export class TrackUsageComponent implements AfterViewInit {
    readonly OFFSET: number = 18;
    readonly COUNTER_OFFSET: number = 100 - this.OFFSET;
    readonly CLOSED_OFFSET: number = 0;
    readonly COUNTER_CLOSED_OFFSET: number = 100 - this.CLOSED_OFFSET;

    readonly MODE_EXPERIMENTS: string = "Experiments";
    readonly MODE_ANALYSIS: string = "Analysis";
    readonly MODE_FILES: string = "Files";

    readonly INTERVAL_10: string = "10";
    readonly INTERVAL_20: string = "20";
    readonly INTERVAL_50: string = "50";
    readonly INTERVAL_ALL: string = "9999";

    readonly AS_OF_6_MONTHS: string = "6 Months";
    readonly AS_OF_YEAR: string = "1 Year";
    readonly AS_OF_2_YEARS: string = "2 Years";
    readonly AS_OF_ALL: string = "All";

    @ViewChild("sidenav") sidenav: ElementRef;
    @ViewChild("mainnav") mainnav: ElementRef;
    @ViewChild("barChart") barChartCanvas: ElementRef;
    @ViewChild("pieChart") pieChartCanvas: ElementRef;
    @ViewChild("lineChart") lineChartCanvas: ElementRef;
    @ViewChild("lineChart2") lineChart2Canvas: ElementRef;
    @ViewChild("pieChart2") pieChart2Canvas: ElementRef;
    @ViewChild("pieChart3") pieChart3Canvas: ElementRef;

    public coreFacilities: any[] = [];
    public idCoreFacility: string = "";

    public show: boolean = false;
    public showLoading: boolean = false;
    public usageType: string = this.MODE_EXPERIMENTS;
    public interval: string = this.INTERVAL_20;
    public showIntervalFilter: boolean = false;
    public asOf: string = this.AS_OF_YEAR;
    public showAsOfFilter: boolean = false;
    public showTotal: boolean = false;
    public total: string = "";
    public totalUnits: string = "";
    public label: string = "";
    public showLabel2: boolean = false;
    public label2: string = "";

    public showBarChart: boolean = false;
    public barChartOptions: any = {};
    public barChartLabels: string[] = [];
    public barChartType: string = '';
    public barChartLegend: boolean = false;
    public barChartData: any[] = [];

    public showPieChart: boolean = false;
    public pieChartOptions: any = {};
    public pieChartLabels: string[] = [];
    public pieChartType: string = '';
    public pieChartLegend: boolean = false;
    public pieChartData: any[] = [];

    public showPieChart2: boolean = false;
    public pieChart2Options: any = {};
    public pieChart2Labels: string[] = [];
    public pieChart2Type: string = '';
    public pieChart2Legend: boolean = false;
    public pieChart2Data: any[] = [];
    public pieChart2Label: string = "";

    public showPieChart3: boolean = false;
    public pieChart3Options: any = {};
    public pieChart3Labels: string[] = [];
    public pieChart3Type: string = '';
    public pieChart3Legend: boolean = false;
    public pieChart3Data: any[] = [];
    public pieChart3Label: string = "";

    public showLineChart: boolean = false;
    public lineChartOptions: any = {};
    public lineChartLabels: string[] = [];
    public lineChartType: string = '';
    public lineChartLegend: boolean = false;
    public lineChartData: any[] = [];

    public showLineChart2: boolean = false;
    public lineChart2Options: any = {};
    public lineChart2Labels: string[] = [];
    public lineChart2Type: string = '';
    public lineChart2Legend: boolean = false;
    public lineChart2Data: any[] = [];

    private lastParams: URLSearchParams = new URLSearchParams();
    public data: any[] = [];
    private lastCalledGraph: any;
    private lastCalledGraphParams: string[];

    constructor(private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private usageService: UsageService) {
        this.coreFacilities = createSecurityAdvisorService.coreFacilitiesICanManage;
    }

    ngAfterViewInit() {
        this.openSidenav();
        this.updateShow(false, false);
    }

    private updateShow(value: boolean, loading: boolean = false): void {
        this.show = value;
        if (!this.show) {
            this.hideAllCharts();
            this.showHideFilters(false, false);
            this.updateLabels("");
        }
        this.showLoading = loading;
    }

    private getParams(): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", this.idCoreFacility);
        params.set("endRank", this.interval);
        params.set("currentView", this.usageType);
        params.set("asOfLast6Months", this.asOf === this.AS_OF_6_MONTHS ? "Y" : "N");
        params.set("asOfLastYear", this.asOf === this.AS_OF_YEAR ? "Y" : "N");
        params.set("asOfLast2Years", this.asOf === this.AS_OF_2_YEARS ? "Y" : "N");
        return params;
    }

    private refreshData(forceRefresh: boolean = false): Observable<any> {
        let params: URLSearchParams = this.getParams();
        if (forceRefresh || !(params.toString() === this.lastParams.toString())) {
            this.lastParams = params;
            return this.usageService.getUsageData(params);
        } else {
            return Observable.of(this.data);
        }
    }

    private hideAllCharts(): void {
        this.showBarChart = false;
        this.showPieChart = false;
        this.showLineChart = false;
        this.showLineChart2 = false;
        this.showPieChart2 = false;
        this.showPieChart3 = false;
    }

    private convertToCSSPercentage(num: number): string {
        return num.toString() + "%";
    }

    public openSidenav(): void {
        this.sidenav.nativeElement.style.width = this.convertToCSSPercentage(this.OFFSET);
        this.mainnav.nativeElement.style.marginLeft = this.convertToCSSPercentage(this.OFFSET);
        this.mainnav.nativeElement.style.width = this.convertToCSSPercentage(this.COUNTER_OFFSET);
    }

    public closeSidenav(): void {
        this.sidenav.nativeElement.style.width = this.convertToCSSPercentage(this.CLOSED_OFFSET);
        this.mainnav.nativeElement.style.marginLeft = this.convertToCSSPercentage(this.CLOSED_OFFSET);
        this.mainnav.nativeElement.style.width = this.convertToCSSPercentage(this.COUNTER_CLOSED_OFFSET);
    }

    private updateTotal(newTotal: string, newTotalUnits: string, showTotal: boolean = true): void {
        this.showTotal = showTotal;
        this.total = Number(newTotal).toLocaleString();
        this.totalUnits = newTotalUnits;
    }

    private updateLabels(newLabel: string, showLabel2: boolean = false, label2: string = "") {
        this.label = newLabel;
        this.showLabel2 = showLabel2;
        this.label2 = label2;
    }

    private showHideFilters(showInterval: boolean, showAsOf: boolean): void {
        this.showIntervalFilter = showInterval;
        this.showAsOfFilter = showAsOf;
    }

    private updateLastCalledGraph(graph: any, params: any[] = []): void {
        this.lastCalledGraph = graph;
        this.lastCalledGraphParams = params;
    }

    public onFilterChange(): void {
        this.lastCalledGraph(...this.lastCalledGraphParams);
    }

    private showCounts(rootField: string, countField: string, label: string, graphLabels: string): void {
        this.updateLastCalledGraph(this.showCounts, [rootField, countField, label, graphLabels]);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let root: any = data[rootField];
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            if (root.Entry) {
                let entries: any[] = root.Entry;
                for (let entry of entries) {
                    newLabels.push(entry.label);
                    newDataValues.push(parseInt(entry[countField]));
                }
            }
            let newDatasets: any[] = [];
            let newDataset: any = {};
            newDataset.data = newDataValues;
            newDataset.label = graphLabels;
            newDatasets.push(newDataset);

            this.updateTotal(root[countField], "");
            this.updateShow(true, false);
            this.showHideFilters(true, false);
            this.updateLabels(label);

            setTimeout(() => {
                this.barChartLabels = newLabels;
                this.barChartData = newDatasets;
                this.barChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                    }
                };
                this.barChartType = 'bar';
                this.barChartLegend = false;
                this.showBarChart = true;
            });
        });
    }

    private showCountsByType(rootField: string, countField: string, label: string): void {
        this.updateLastCalledGraph(this.showCountsByType, [rootField, countField, label]);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let root: any = data[rootField];
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            if (root.Entry) {
                let entries: any[] = root.Entry;
                for (let entry of entries) {
                    newLabels.push(entry.label);
                    newDataValues.push(parseInt(entry[countField]));
                }
            }

            this.updateTotal(root[countField], "");
            this.updateShow(true, false);
            this.showHideFilters(false, false);
            this.updateLabels(label);

            setTimeout(() => {
                this.pieChartLabels = newLabels;
                this.pieChartData = newDataValues;
                this.pieChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                };
                this.pieChartType = 'pie';
                this.pieChartLegend = true;
                this.showPieChart = true;
            });
        });
    }

    private showActivityByWeek(countField: string, label:string, graphLabels: string): void {
        this.updateLastCalledGraph(this.showActivityByWeek, [countField, label, graphLabels]);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let newLabels: string[] = [];
            let newUploadValues: number[] = [];
            let newDownloadValues: number[] = [];
            let newCountValues: number[] = [];
            let entries: any[] = data.SummaryActivityByWeek;
            for (let entry of entries) {
                newLabels.push(entry.label);
                newUploadValues.push(parseInt(entry.uploadCount));
                newDownloadValues.push(parseInt(entry.downloadCount));
                newCountValues.push(parseInt(entry[countField]));
            }
            let newDatasets: any[] = [];
            let newUploadDataset: any = {};
            newUploadDataset.data = newUploadValues;
            newUploadDataset.label = '# of Uploads';
            newDatasets.push(newUploadDataset);
            let newDownloadDataset: any = {};
            newDownloadDataset.data = newDownloadValues;
            newDownloadDataset.label = '# of Downloads';
            newDatasets.push(newDownloadDataset);
            let chart2Datasets: any[] = [];
            let chart2Dataset: any = {};
            chart2Dataset.data = newCountValues;
            chart2Dataset.label = graphLabels;
            chart2Datasets.push(chart2Dataset);

            this.updateTotal("", "", false);
            this.updateShow(true, false);
            this.showHideFilters(false, true);
            this.updateLabels("Uploads And Downloads By Week", true, label);

            setTimeout(() => {
                let options: any = {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                    },
                    elements: {
                        line: {
                            tension: 0
                        }
                    }
                };

                this.lineChartLabels = newLabels;
                this.lineChartData = newDatasets;
                this.lineChartOptions = options;
                this.lineChartType = 'line';
                this.lineChartLegend = true;
                this.showLineChart = true;

                this.lineChart2Labels = newLabels;
                this.lineChart2Data = chart2Datasets;
                this.lineChart2Options = options;
                this.lineChart2Type = 'line';
                this.lineChart2Legend = false;
                this.showLineChart2 = true;
            });
        });
    }

    private showDiskSpace(rootField: string, showInterval: string, label: string): void {
        this.updateLastCalledGraph(this.showDiskSpace, [rootField, showInterval, label]);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let root: any = data[rootField];
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            if (root.Entry) {
                let entries: any[] = root.Entry;
                for (let entry of entries) {
                    newLabels.push(entry.label);
                    newDataValues.push(parseInt(entry.diskSpaceGB));
                }
            }
            let newDatasets: any[] = [];
            let newDataset: any = {};
            newDataset.data = newDataValues;
            newDataset.label = 'Disk Space (GB)';
            newDatasets.push(newDataset);

            this.updateTotal(root.diskSpaceGB, " GB");
            this.updateShow(true, false);
            this.showHideFilters(showInterval === "Y", false);
            this.updateLabels(label);

            setTimeout(() => {
                this.barChartLabels = newLabels;
                this.barChartData = newDatasets;
                this.barChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                    }
                };
                this.barChartType = 'bar';
                this.barChartLegend = false;
                this.showBarChart = true;
            });
        });
    }

    public showExperiments(): void {
        this.showCounts("SummaryExperimentsByLab", "experimentCount", "Experiments", "# of Experiments");
    }

    public showExperimentsByType(): void {
        this.showCountsByType("SummaryExperimentsByType", "experimentCount", "Experiments By Type");
    }

    public showExperimentsIllumina(): void {
        this.updateLastCalledGraph(this.showExperimentsIllumina);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let summarySeqExperimentsByApp: any = data.SummarySeqExperimentsByApp;
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            if (summarySeqExperimentsByApp.Entry) {
                let entries: any[] = summarySeqExperimentsByApp.Entry;
                for (let entry of entries) {
                    newLabels.push(entry.label);
                    newDataValues.push(parseInt(entry.experimentCount));
                }
            }

            this.updateTotal(summarySeqExperimentsByApp.experimentCount, "");
            this.updateShow(true, false);
            this.showHideFilters(false, false);
            this.updateLabels("Seq Experiments By Experiment Type");

            setTimeout(() => {
                this.pieChartLabels = newLabels;
                this.pieChartData = newDataValues;
                this.pieChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                };
                this.pieChartType = 'pie';
                this.pieChartLegend = true;
                this.showPieChart = true;
            });
        });
    }

    public showExperimentsActivityByWeek(): void {
        this.showActivityByWeek("experimentCount", "Experiments By Week", "# of Experiments");
    }

    public showDiskSpaceByYear(): void {
        this.showDiskSpace("SummaryDiskSpaceByYear", "N", "Disk Space By Year (GB)");
    }

    public showAnalysis(): void {
        this.showCounts("SummaryAnalysisByLab", "analysisCount", "Analyses", "# of Analyses");
    }

    public showAnalysisByType(): void {
        this.showCountsByType("SummaryAnalysisByType", "analysisCount", "Analyses By Type");
    }

    public showAnalysisByWeek(): void {
        this.showActivityByWeek("analysisCount", "Analyses By Week", "# of Analyses");
    }

    public showFilesDaysSinceLastUpload(): void {
        this.updateLastCalledGraph(this.showFilesDaysSinceLastUpload);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let summaryDaysSinceLastUpload: any[] = data.SummaryDaysSinceLastUpload;
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            for (let entry of summaryDaysSinceLastUpload) {
                newLabels.push(entry.label);
                newDataValues.push(parseInt(entry.days));
            }
            let newDatasets: any[] = [];
            let newDataset: any = {};
            newDataset.data = newDataValues;
            newDataset.label = "Days";
            newDatasets.push(newDataset);

            this.updateTotal("", "", false);
            this.updateShow(true, false);
            this.showHideFilters(true, false);
            this.updateLabels("Days Since Last Upload");

            setTimeout(() => {
                this.barChartLabels = newLabels;
                this.barChartData = newDatasets;
                this.barChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                autoSkip: false
                            }
                        }],
                    }
                };
                this.barChartType = 'horizontalBar';
                this.barChartLegend = false;
                this.showBarChart = true;
            });
        });
    }

    public showFilesUploads(): void {
        this.showCounts("SummaryUploadsByLab", "uploadCount", "Uploads", "# of Uploads");
    }

    public showFilesDownloads(): void {
        this.showCounts("SummaryDownloadsByLab", "downloadCount", "Downloads", "# of Downloads");
    }

    public showFilesDiskSpace(): void {
        this.showDiskSpace("SummaryDiskSpaceByLab", "Y", "Disk Space By Lab (GB)");
    }

    public showFilesDiskSpaceByCategory(): void {
        this.updateLastCalledGraph(this.showFilesDiskSpaceByCategory);
        this.updateShow(false, true);
        this.refreshData().subscribe((data: any) => {
            this.data = data;

            let summaryDiskSpaceByAnalysis: any = data.SummaryDiskSpaceByAnalysis;
            let newLabels: string[] = [];
            let newDataValues: number[] = [];
            if (summaryDiskSpaceByAnalysis.Entry) {
                let entries: any[] = summaryDiskSpaceByAnalysis.Entry;
                for (let entry of entries) {
                    newLabels.push(entry.label);
                    newDataValues.push(parseInt(entry.diskSpaceGB));
                }
            }

            let summaryDiskSpaceByExperiment: any = data.SummaryDiskSpaceByExperiment;
            let newLabels2: string[] = [];
            let newDataValues2: number[] = [];
            if (summaryDiskSpaceByExperiment.Entry) {
                let entries: any[] = summaryDiskSpaceByExperiment.Entry;
                for (let entry of entries) {
                    newLabels2.push(entry.label);
                    newDataValues2.push(parseInt(entry.diskSpaceGB));
                }
            }

            let analysisDiskSpace: number = parseInt(summaryDiskSpaceByAnalysis.diskSpaceGB);
            let experimentDiskSpace: number = parseInt(summaryDiskSpaceByExperiment.diskSpaceGB);
            let total: number = analysisDiskSpace + experimentDiskSpace;
            this.updateTotal(total.toString(), " GB");
            this.updateShow(true, false);
            this.showHideFilters(false, false);
            this.updateLabels("Disk Space By Category (GB)");

            this.pieChart2Label = "Analysis (" + analysisDiskSpace.toLocaleString() + " GB)";
            this.pieChart3Label = "Experiment (" + experimentDiskSpace.toLocaleString() + " GB)";

            setTimeout(() => {
                this.pieChart2Labels = newLabels;
                this.pieChart2Data = newDataValues;
                this.pieChart2Options = {
                    responsive: true,
                    maintainAspectRatio: false,
                };
                this.pieChart2Type = 'pie';
                this.pieChart2Legend = true;
                this.showPieChart2 = true;

                this.pieChart3Labels = newLabels2;
                this.pieChart3Data = newDataValues2;
                this.pieChart3Options = {
                    responsive: true,
                    maintainAspectRatio: false,
                };
                this.pieChart3Type = 'pie';
                this.pieChart3Legend = true;
                this.showPieChart3 = true;
            });
        });
    }

    public print(): void {
        let doc: string = "<html><head><title>Print</title></head><body>";
        doc += "<h4>" + this.label + "</h4>";
        if (this.showBarChart || this.showPieChart) {
            let url: string = "";
            if (this.showBarChart) {
                url = this.barChartCanvas.nativeElement.toDataURL();
            } else if (this.showPieChart) {
                url = this.pieChartCanvas.nativeElement.toDataURL();
            }
            doc += "<img style='width: 100%' src='" + url + "'/>";
        } else if (this.showLineChart && this.showLineChart2) {
            doc += "<img style='width: 100%' src='" + this.lineChartCanvas.nativeElement.toDataURL() + "'/>";
            doc += "<h4>" + this.label2 + "</h4>";
            doc += "<img style='width: 100%' src='" + this.lineChart2Canvas.nativeElement.toDataURL() + "'/>";
        } else if (this.showPieChart2 && this.showPieChart3) {
            doc += "<h5>" + this.pieChart2Label + "</h5>";
            doc += "<img style='width: 100%' src='" + this.pieChart2Canvas.nativeElement.toDataURL() + "'/>";
            doc += "<h5>" + this.pieChart3Label + "</h5>";
            doc += "<img style='width: 100%' src='" + this.pieChart3Canvas.nativeElement.toDataURL() + "'/>";
        }
        doc += "</body></html>";

        // TODO There is an error in Typescript 2.8.1 that flags this code, it will be fixed in 2.8.2
        /*
        let printWindow = window.open();
        printWindow.document.open();
        printWindow.document.write(doc);
        printWindow.document.close(); // necessary for IE >= 10
        printWindow.addEventListener("load", function() {
            printWindow.focus(); // necessary for IE >= 10
            printWindow.print();
            printWindow.close();
        });
    }

}
