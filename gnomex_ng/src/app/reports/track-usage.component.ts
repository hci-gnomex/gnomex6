import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UsageService} from "../services/usage.service";
import {Observable, Subscription} from "rxjs";
import {of} from "rxjs";
import {ConstantsService} from "../services/constants.service";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {UtilService} from "../services/util.service";
import * as chartJS from "chart.js";
import {MatDialogConfig} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";
import {TrackUsageDetailComponent} from "./track-usage-detail.component";

@Component({
    selector: 'track-usage',
    template: `
        <as-split>
            <as-split-area [size]="25">
                <div class="flex-container-col full-width full-height children-margin-bottom padded">
                    <div>
                        <h5><img [src]="this.constantsService.ICON_BAR_CHART" class="icon">Usage</h5>
                    </div>
                    <div>
                        <mat-radio-group [(ngModel)]="this.usageType" class="flex-container-col" (change)="this.onUsageTypeChange()">
                            <mat-radio-button [value]="this.MODE_EXPERIMENTS" class="margin-left">Experiments</mat-radio-button>
                            <mat-radio-button [value]="this.MODE_ANALYSIS" class="margin-left">Analysis</mat-radio-button>
                            <mat-radio-button [value]="this.MODE_FILES" class="margin-left">Files</mat-radio-button>
                        </mat-radio-group>
                    </div>
                    <div class="flex-container-col full-width children-margin-bottom">
                        <div class="full-width flex-container-col align-center">
                            <custom-combo-box class="three-quarters-width" placeholder="Core facility" [(ngModel)]="this.idCoreFacility" 
                                          valueField="idCoreFacility" [options]="this.coreFacilities" displayField="display" (optionSelected)="this.onCoreFacilityChange()">
                            </custom-combo-box>
                        </div>
                        <label class="bold margin-left">Lab Activity</label>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_EXPERIMENTS">
                            <button mat-button class="underlined" (click)="showExperiments()" [disabled]="!this.idCoreFacility">Experiments</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_ANALYSIS">
                            <button mat-button class="underlined" (click)="showAnalysis()">Analysis</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_FILES">
                            <button mat-button class="underlined" (click)="showFilesDaysSinceLastUpload()">Days Since Last Upload</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_FILES">
                            <button mat-button class="underlined" (click)="showFilesUploads()">Uploads</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_FILES">
                            <button mat-button class="underlined" (click)="showFilesDownloads()">Downloads</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_FILES">
                            <button mat-button class="underlined" (click)="showFilesDiskSpace()">Disk Space</button>
                        </div>
                        <label class="bold margin-left">Overall Activity</label>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_EXPERIMENTS">
                            <button mat-button class="underlined" (click)="showExperimentsByType()" [disabled]="!this.idCoreFacility">Experiments By Type</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_EXPERIMENTS">
                            <button mat-button class="underlined" (click)="showExperimentsIllumina()" [disabled]="!this.idCoreFacility">Illumina Sequencing Experiment Type</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_EXPERIMENTS">
                            <button mat-button class="underlined" (click)="showExperimentsActivityByWeek()" [disabled]="!this.idCoreFacility">Activity By Week</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_EXPERIMENTS">
                            <button mat-button class="underlined" (click)="showDiskSpaceByYear()" [disabled]="!this.idCoreFacility">Disk Space By Year</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_ANALYSIS">
                            <button mat-button class="underlined" (click)="showAnalysisByType()">Analysis By Type</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_ANALYSIS">
                            <button mat-button class="underlined" (click)="showAnalysisByWeek()">Activity By Week</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_ANALYSIS">
                            <button mat-button class="underlined" (click)="showDiskSpaceByYear()">Disk Space By Year</button>
                        </div>
                        <div class="margin-left-large" *ngIf="this.usageType === this.MODE_FILES">
                            <button mat-button class="underlined" (click)="showFilesDiskSpaceByCategory()">Disk Space By Category</button>
                        </div>
                    </div>
                </div>
            </as-split-area>
            <as-split-area [size]="75">
                <div class="flex-container-col full-height full-width padded children-margin-bottom">
                    <div *ngIf="show" class="full-width flex-container-row justify-space-between">
                        <div>
                            <label>{{label}}</label>
                            <span class="margin-left details-note" *ngIf="this.showInteractiveChartNote">Click on chart to see details</span>
                        </div>
                        <label *ngIf="showTotal">Total: {{total}}{{totalUnits}}</label>
                    </div>
                    <div *ngIf="showLoading" class="flex-container-row justify-center align-center full-width flex-grow">
                        <mat-spinner [strokeWidth]="10" [diameter]="80"></mat-spinner>
                    </div>
                    <div *ngIf="showBarChart" class="flex-grow full-width">
                        <canvas #barChart baseChart width="100%" height="100%"
                                [datasets]="barChartData"
                                [labels]="barChartLabels"
                                [options]="barChartOptions"
                                [legend]="barChartLegend"
                                [chartType]="barChartType">
                        </canvas>
                    </div>
                    <div *ngIf="showPieChart" class="flex-grow full-width">
                        <canvas #pieChart baseChart width="100%" height="100%"
                                [data]="pieChartData"
                                [labels]="pieChartLabels"
                                [options]="pieChartOptions"
                                [legend]="pieChartLegend"
                                [chartType]="pieChartType">
                        </canvas>
                    </div>
                    <div *ngIf="showLineChart" class="flex-grow full-width">
                        <canvas #lineChart baseChart width="100%" height="100%"
                                [datasets]="lineChartData"
                                [labels]="lineChartLabels"
                                [options]="lineChartOptions"
                                [legend]="lineChartLegend"
                                [chartType]="lineChartType">
                        </canvas>
                    </div>
                    <div *ngIf="showLabel2">
                        <label>{{label2}}</label>
                        <span class="margin-left details-note" *ngIf="this.showInteractiveChartNote">Click on chart to see details</span>
                    </div>
                    <div *ngIf="showLineChart2" class="flex-grow full-width">
                        <canvas #lineChart2 baseChart width="100%" height="100%"
                                [datasets]="lineChart2Data"
                                [labels]="lineChart2Labels"
                                [options]="lineChart2Options"
                                [legend]="lineChart2Legend"
                                [chartType]="lineChart2Type">
                        </canvas>
                    </div>
                    <div *ngIf="showPieChart2" class="flex-grow full-width">
                        <label>{{pieChart2Label}}</label>
                        <canvas #pieChart2 baseChart width="100%" height="100%"
                                [data]="pieChart2Data"
                                [labels]="pieChart2Labels"
                                [options]="pieChart2Options"
                                [legend]="pieChart2Legend"
                                [chartType]="pieChart2Type">
                        </canvas>
                    </div>
                    <div *ngIf="showPieChart3" class="flex-grow full-width">
                        <label>{{pieChart3Label}}</label>
                        <canvas #pieChart3 baseChart width="100%" height="100%"
                                [data]="pieChart3Data"
                                [labels]="pieChart3Labels"
                                [options]="pieChart3Options"
                                [legend]="pieChart3Legend"
                                [chartType]="pieChart3Type">
                        </canvas>
                    </div>
                    <div *ngIf="show" class="full-width flex-container-row justify-flex-end align-center">
                        <div *ngIf="showIntervalFilter" class="flex-grow">
                            <mat-radio-group [(ngModel)]="this.interval" class="flex-container-row children-margin-right" (change)="onFilterChange()">
                                <mat-radio-button [value]="INTERVAL_10">Top 10</mat-radio-button>
                                <mat-radio-button [value]="INTERVAL_20">Top 20</mat-radio-button>
                                <mat-radio-button [value]="INTERVAL_50">Top 50</mat-radio-button>
                                <mat-radio-button [value]="INTERVAL_ALL">All</mat-radio-button>
                            </mat-radio-group>
                        </div>
                        <div *ngIf="showAsOfFilter" class="flex-grow">
                            <mat-radio-group [(ngModel)]="this.asOf" class="flex-container-row children-margin-right" (change)="onFilterChange()">
                                <mat-radio-button [value]="AS_OF_6_MONTHS">Last 6 Months</mat-radio-button>
                                <mat-radio-button [value]="AS_OF_YEAR">Last Year</mat-radio-button>
                                <mat-radio-button [value]="AS_OF_2_YEARS">Last 2 Years</mat-radio-button>
                                <mat-radio-button [value]="AS_OF_ALL">All</mat-radio-button>
                            </mat-radio-group>
                        </div>
                        <button mat-raised-button (click)="print()"><img class="icon" [src]="this.constantsService.ICON_PRINTER">Print</button>
                    </div>
                </div>
            </as-split-area>
        </as-split>
    `,
    styles: [`
        .margin-left {
            margin-left: 1em;
        }
        .margin-left-large {
            margin-left: 2em;
        }
        .children-margin-bottom > *:not(:last-child) {
            margin-bottom: 1em;
        }
        .children-margin-right > *:not(:last-child) {
            margin-right: 1em;
        }
        .three-quarters-width {
            width: 75%;
        }
        .details-note {
            background: yellow;
            border-radius: 0.3em;
            padding: 0.3em;
        }
    `],
})

export class TrackUsageComponent implements OnInit, OnDestroy {
    public readonly MODE_EXPERIMENTS: string = "Experiments";
    public readonly MODE_ANALYSIS: string = "Analysis";
    public readonly MODE_FILES: string = "Files";

    public readonly INTERVAL_10: string = "10";
    public readonly INTERVAL_20: string = "20";
    public readonly INTERVAL_50: string = "50";
    public readonly INTERVAL_ALL: string = "9999";

    public readonly AS_OF_6_MONTHS: string = "6 Months";
    public readonly AS_OF_YEAR: string = "1 Year";
    public readonly AS_OF_2_YEARS: string = "2 Years";
    public readonly AS_OF_ALL: string = "All";

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
    public showInteractiveChartNote: boolean = false;
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

    private lastParams: HttpParams = new HttpParams();
    public data: any = null;
    private lastCalledGraphFn: (...args: any[]) => void;
    private lastCalledGraphFnParams: any[];
    private currentSubscription: Subscription;

    constructor(public constantsService: ConstantsService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private usageService: UsageService) {
    }

    ngOnInit() {
        this.coreFacilities = this.createSecurityAdvisorService.coreFacilitiesICanManage;

        this.onUsageTypeChange();
    }

    public onUsageTypeChange(): void {
        if (this.usageType === this.MODE_EXPERIMENTS) {
            UtilService.safelyUnsubscribe(this.currentSubscription);
            this.updateShow(false, false);
        } else if (this.usageType === this.MODE_ANALYSIS) {
            this.showAnalysis();
        } else if (this.usageType === this.MODE_FILES) {
            this.showFilesDaysSinceLastUpload();
        }
    }

    public onCoreFacilityChange(): void {
        if (this.idCoreFacility && this.usageType === this.MODE_EXPERIMENTS) {
            this.showExperiments();
        }
    }

    private updateShow(value: boolean, loading: boolean = false): void {
        this.show = value;
        if (!this.show) {
            this.hideAllCharts();
            this.showHideFilters(false, false);
            this.updateLabels("");
            this.showInteractiveChartNote = false;
        }
        this.showLoading = loading;
    }

    private refreshData(forceRefresh: boolean = false): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", this.idCoreFacility ? this.idCoreFacility : "")
            .set("endRank", this.interval)
            .set("currentView", this.usageType)
            .set("asOfLast6Months", this.asOf === this.AS_OF_6_MONTHS ? "Y" : "N")
            .set("asOfLastYear", this.asOf === this.AS_OF_YEAR ? "Y" : "N")
            .set("asOfLast2Years", this.asOf === this.AS_OF_2_YEARS ? "Y" : "N");

        if (forceRefresh || !(params.toString() === this.lastParams.toString()) || !this.data) {
            this.lastParams = params;
            return this.usageService.getUsageData(params);
        } else {
            return of(this.data);
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

    private updateLastCalledGraphFn(graphFn: (...args: any[]) => void, params: any[] = []): void {
        this.lastCalledGraphFn = graphFn;
        this.lastCalledGraphFnParams = params;
    }

    public onFilterChange(): void {
        this.lastCalledGraphFn(...this.lastCalledGraphFnParams);
    }

    private showCounts(rootField: string, countField: string, label: string, graphLabels: string): void {
        this.updateLastCalledGraphFn(this.showCounts, [rootField, countField, label, graphLabels]);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
        this.updateLastCalledGraphFn(this.showCountsByType, [rootField, countField, label]);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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

    private showActivityByWeek(countField: string, label: string, graphLabels: string): void {
        this.updateLastCalledGraphFn(this.showActivityByWeek, [countField, label, graphLabels]);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
            this.showInteractiveChartNote = true;

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
                    },
                    onClick: this.showUsageDetail,
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

    private showUsageDetail: (event: MouseEvent, activeElements: any[]) => void = (event: MouseEvent, activeElements: any[]) => {
        if (activeElements.length) {
            let dataPoint: any = this.data.SummaryActivityByWeek[activeElements[0]._index];
            let detailConfig: MatDialogConfig = new MatDialogConfig();
            detailConfig.data = {
                idCoreFacility: this.idCoreFacility,
                fields: [],
                startDate: dataPoint.startDate,
            };

            let chartConfig: chartJS.ChartConfiguration = activeElements[0]._chart.config;
            let title: string = "";

            // Uploads and downloads chart
            if (chartConfig.data.datasets.length === 2) {
                title = "Uploads and Downloads for ";
                detailConfig.data.fields.push("uploadCount");
                detailConfig.data.fields.push("downloadCount");
            }
            // Count chart
            else if (chartConfig.data.datasets.length === 1) {
                if (this.usageType === this.MODE_EXPERIMENTS) {
                    title = "Experiments for ";
                    detailConfig.data.fields.push("experimentCount");
                } else if (this.usageType === this.MODE_ANALYSIS) {
                    title = "Analyses for ";
                    detailConfig.data.fields.push("analysisCount");
                }
            }

            title += dataPoint.dataTip;
            this.dialogsService.genericDialogContainer(TrackUsageDetailComponent, title, null, detailConfig);
        }
    };

    private showDiskSpace(rootField: string, showInterval: string, label: string): void {
        this.updateLastCalledGraphFn(this.showDiskSpace, [rootField, showInterval, label]);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
        this.updateLastCalledGraphFn(this.showExperimentsIllumina);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
        this.updateLastCalledGraphFn(this.showFilesDaysSinceLastUpload);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
        this.updateLastCalledGraphFn(this.showFilesDiskSpaceByCategory);
        this.updateShow(false, true);
        UtilService.safelyUnsubscribe(this.currentSubscription);
        this.currentSubscription = this.refreshData().pipe(first()).subscribe((data: any) => {
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
        let doc: string = "<html><head><title>Usage</title></head><body>";
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

    ngOnDestroy(): void {
        UtilService.safelyUnsubscribe(this.currentSubscription);
    }

}
