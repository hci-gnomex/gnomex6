import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {AnalysisService} from "../../services/analysis.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {GridApi, GridReadyEvent, RowNode, RowSelectedEvent} from "ag-grid-community";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {DataTrackService} from "../../services/data-track.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {HttpUriEncodingCodec} from "../../services/interceptors/http-uri-encoding-codec";

@Component({
    template: `
        <div class="full-width flex-container-col double-padded-left-right">
            <div *ngIf="this.showErrorAction">
                <label class="error-action">{{this.errorMessage}}</label>
            </div>
            <div *ngIf="this.showParentAction">
                <label class="info-action">Specify maternal and paternal ids.</label>
            </div>
            <div *ngIf="this.showSaveAction">
                <label class="info-action">Press Save to save the modified ped file.</label>
            </div>
            <div *ngIf="this.showLaunchAction">
                <label class="info-action">Click on the sample_id of the trio proband then press Launch.</label>
            </div>
            <div>
                <mat-checkbox [(ngModel)]="this.onlyShowSamplesWithParents" (change)="this.refreshGrid()">Only show samples with parents</mat-checkbox>
            </div>
            <div class="grid-container">
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 (rowSelected)="this.onGridSelected($event)"
                                 (cellValueChanged)="this.onGridChanged()"
                                 [columnDefs]="this.gridColDefs"
                                 [rowSelection]="'single'"
                                 [singleClickEdit]="true"
                                 [enableColResize]="true">
                </ag-grid-angular>
            </div>
        </div>
        <mat-dialog-actions class="justify-flex-end no-margin no-padding generic-dialog-footer-colors">
            <div class="double-padded-right">
                <button mat-raised-button color="primary" class="primary-action" [disabled]="this.currentPedFileIndex <= 0" (click)="this.changePed(-1)"><img [src]="this.constantsService.ICON_ARROW_LEFT" class="icon">Previous</button>
                <button mat-raised-button color="primary" class="primary-action" [disabled]="this.currentPedFileIndex >= (this.pedInfo.length - 1)" (click)="this.changePed(1)"><img [src]="this.constantsService.ICON_ARROW_RIGHT" class="icon">Next</button>
                <button mat-raised-button color="primary" class="primary-action" [disabled]="this.selectedEntryNode === null" (click)="this.launch()"><img [src]="this.constantsService.ICON_IOBIO" class="icon">Launch</button>
                <button mat-raised-button color="primary" class="primary-action" [disabled]="!this.showSaveAction" (click)="this.save()"><img [src]="this.constantsService.ICON_IOBIO" class="icon">Save</button>
                <button mat-raised-button color="accent" class="secondary-action" mat-dialog-close>Cancel</button>
            </div>
        </mat-dialog-actions>
    `,
    styles:[`
        label.error-action {
            color: red;
        }
        label.info-action {
            color: blue;
        }
        div.grid-container {
            width: 100%;
            height: 21em;
        }
        .double-padded-left-right {
            padding: 0.3em 0.6em 0.3em 0.6em;
        }
        .primary-action {
            background-color: var(--bluewarmvivid-medlight);
            font-weight: bolder;
            color: white;
        }
        .secondary-action {
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }
    `]
})
export class ManagePedFileWindowComponent extends BaseGenericContainerDialog implements OnInit {

    public pedInfo: any[] = [];
    private vcfInfo: any[] = [];
    private bamInfo: any[] = [];
    private pedFile: any[] = [];
    public currentPedFileIndex: number = 0;

    public errorMessage: string = "";
    public showErrorAction: boolean = false;
    public showParentAction: boolean = false;
    public showSaveAction: boolean = false;
    public showLaunchAction: boolean = false;

    public onlyShowSamplesWithParents: boolean = false;
    private allPedEntries: any[] = [];
    public filteredPedEntries: any[] = [];
    private gridApi: GridApi;
    public selectedEntryNode: RowNode = null;
    public gridColDefs: any[] = []; // TODO: this wasn't defined and need to fix

    private sexList: any[] = [
        {sex: 'Unknown'},
        {sex: 'Male'},
        {sex: 'Female'},
    ];
    private affectedList: any[] = [
        {affection_status: 'Unknown'},
        {affection_status: 'Yes'},
        {affection_status: 'No'}
    ];

    constructor(private dialogRef: MatDialogRef<ManagePedFileWindowComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constantsService: ConstantsService,
                private analysisService: AnalysisService,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService) {
        super();
    }

    ngOnInit() {
        if (this.data && this.data.idAnalysis) {
            this.analysisService.getAnalysisDownloadList(this.data.idAnalysis).subscribe((result: any) => {
                if (result && result.Analysis) {
                    this.gatherInfo(result);
                    this.initializeFromPedFile(result.Analysis);
                }
            },(err:IGnomexErrorResponse) =>{
                this.handleControllerError(err.gError,"retrieving file download list")
            });
        } else {
            this.dialogsService.alert("No analysis found", "Data Not Found");
        }
    }

    private gatherInfo(result: any): void {
        this.pedInfo = result.PEDInfo.PEDPath ? result.PEDInfo.PEDPath : [];
        this.vcfInfo = result.VCFInfo.VCFPath ? result.VCFInfo.VCFPath : [];
        this.bamInfo = result.BAMInfo.BAMPath ? result.BAMInfo.BAMPath : [];
        this.pedFile = [];
        if (result.PEDFile) {
            if (result.PEDFile.PEDEntry) {
                for (let entry of result.PEDFile.PEDEntry) {
                    this.pedFile.push(entry);
                }
            }
            if (result.PEDFile.PEDHeader) {
                for (let header of result.PEDFile.PEDHeader) {
                    this.pedFile.push(header);
                }
            }
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    private initializeFromPedFile(analysis?: any): void {
        let pedFilename: string = "";
        if (this.pedInfo.length > 0) {
            let fullPedFilename: string = this.pedInfo[this.currentPedFileIndex].path;
            let lastSlashIndex: number = fullPedFilename.lastIndexOf("/");
            pedFilename = lastSlashIndex > 0 ? fullPedFilename.substring(lastSlashIndex + 1) : "";
        } else if (analysis && analysis.number) {
            pedFilename = analysis.number + ".ped";
        }
        this.innerTitle = "Manage Ped File -- " + pedFilename;

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("idAnalysis", this.data.idAnalysis)
            .set("action", "setup")
            .set("fileOffset", "" + this.currentPedFileIndex)
            .set("VCFInfo", JSON.stringify(this.vcfInfo))
            .set("BAMInfo", JSON.stringify(this.bamInfo))
            .set("PEDInfo", JSON.stringify(this.pedInfo));
        this.analysisService.managePedFile(params).subscribe((result: any) => {
            if (result) {
                this.gatherInfo(result);

                this.selectedEntryNode = null;
                this.errorMessage = "";
                this.showErrorAction = false;
                this.showParentAction = false;
                this.showSaveAction = false;
                this.showLaunchAction = false;
                if (result.PEDAction && result.PEDAction.ActionDescription) {
                    let reason: string = result.PEDAction.ActionDescription[0].reason;
                    if (reason.includes("Error")) {
                        this.errorMessage = reason;
                        this.showErrorAction = true;
                    }
                    if (reason.includes("choose")) {
                        this.showLaunchAction = true;
                    }
                    if (reason.includes("save")) {
                        this.showSaveAction = true;
                    }
                    if (reason.includes("parent")) {
                        this.showParentAction = true;
                    }
                }

                this.allPedEntries = [];
                this.onlyShowSamplesWithParents = false;
                if (result.PEDFile && result.PEDFile.PEDEntry) {
                    this.allPedEntries = result.PEDFile.PEDEntry;
                }
                this.updateGridColDefs();
                this.refreshGrid();
            } else {
                this.handleControllerError(result, "retrieving ped file list");
            }
        });
    }

    public changePed(increment: number): void {
        this.currentPedFileIndex += increment;
        this.initializeFromPedFile();
    }

    public refreshGrid(): void {
        if (this.onlyShowSamplesWithParents) {
            this.filteredPedEntries = this.allPedEntries.filter((entry: any) => {
                return entry.maternal_id !== "0" && entry.paternal_id !== "0";
            });
        } else {
            this.filteredPedEntries = this.allPedEntries;
        }
        this.filteredPedEntries.sort((a: any, b: any) => {
            return (a.sample_id as string).localeCompare(b.sample_id);
        });
        this.gridApi.setRowData(this.filteredPedEntries);
        this.gridApi.sizeColumnsToFit();
    }

    private updateGridColDefs(): void {
        let sampleIdList: any[] = [{kindred_id: '', sample_id: '0', paternal_id: '0', maternal_id: '0', sex: '', affection_status: 'Unknown', project: '', bam: '', vcf: ''}];
        for (let entry of this.allPedEntries) {
            sampleIdList.push(entry);
        }
        sampleIdList.sort((a: any, b: any) => {
            return (a.sample_id as string).localeCompare(b.sample_id);
        });

        let colDefs: any[] = [
            {headerName: "Sample_Id", field: "sample_id"},
            {headerName: "Paternal_Id", editable: true, field: "paternal_id", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: sampleIdList, selectOptionsDisplayField: "sample_id",
                selectOptionsValueField: "sample_id"},
            {headerName: "Maternal_Id", editable: true, field: "maternal_id", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: sampleIdList, selectOptionsDisplayField: "sample_id",
                selectOptionsValueField: "sample_id"},
            {headerName: "Sex", editable: true, field: "sex", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.sexList, selectOptionsDisplayField: "sex",
                selectOptionsValueField: "sex"},
            {headerName: "Affected", editable: true, field: "affection_status", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.affectedList, selectOptionsDisplayField: "affection_status",
                selectOptionsValueField: "affection_status"},
            {headerName: "Vcf", editable: true, field: "vcf", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.vcfInfo, selectOptionsDisplayField: "path",
                selectOptionsValueField: "path", tooltipField: "vcf"},
            {headerName: "Bam", editable: true, field: "bam", cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.bamInfo, selectOptionsDisplayField: "path",
                selectOptionsValueField: "path", tooltipField: "bam"}
        ];
        this.gridApi.setColumnDefs(colDefs);
    }

    public onGridSelected(event: RowSelectedEvent): void {
        this.selectedEntryNode = event.node;
    }

    public onGridChanged(): void {
        this.showSaveAction = true;
    }

    private handleControllerError(result: any, action: string): void {
        let message: string = "";
        if (result && result.message) {
            message = ": " + result.message;
        }
        this.dialogsService.error("An error occurred while " + action + message);
    }

    public launch(): void {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("idAnalysis", this.data.idAnalysis)
            .set("proband", JSON.stringify(this.selectedEntryNode.data))
            .set("VCFInfo", JSON.stringify(this.vcfInfo))
            .set("BAMInfo", JSON.stringify(this.bamInfo))
            .set("PEDFile", JSON.stringify(this.pedFile));
        this.dataTrackService.makeGENELink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                window.open(result.urlsToLink, "_blank");
            }
        }, (err:IGnomexErrorResponse) =>{
            this.handleControllerError(err.gError,"launching gene.iobio.io" );
        });
    }

    public save(): void {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("idAnalysis", this.data.idAnalysis)
            .set("fileOffset", "" + this.currentPedFileIndex)
            .set("action", "save")
            .set("PEDFile", JSON.stringify(this.pedFile))
            .set("PEDInfo", JSON.stringify(this.pedInfo));
        this.analysisService.managePedFile(params).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                this.dialogsService.alert("Ped file saved successfully", null, DialogType.SUCCESS);
                this.initializeFromPedFile();
            } else {
                this.handleControllerError(result, "saving ped file");
            }
        });
    }

}
