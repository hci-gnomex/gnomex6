import {Component, ElementRef, Inject, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {MatDialogConfig} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridApi, GridSizeChangedEvent} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DateRange} from "../util/date-range-filter.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {DOCUMENT} from "@angular/common";
import {EditFlowcellDialogComponent} from "./edit-flowcell-dialog.component";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {ConstantsService} from "../services/constants.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateParserComponent} from "../util/parsers/date-parser.component";


@Component({
    selector: 'flowcell-workflow',
    templateUrl: 'flowcell-workflow.html',
    styles: [`
        
        
        .reserved-space {
            min-width: 12em;
        }
        
        .margin-children > *:not(:last-child) {
            margin-right: 0.3em;
        }
        
        
    `]
})

export class FlowcellWorkflowComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    private emToPxConversionRate: number = 13;


    public get columnDefs(): any[] {
        let results: any[] = [];

        results.push({
            headerName: "Flow Cell",
            editable: false,
            width: 1,
            minWidth: 5 * this.emToPxConversionRate,
            field: "number",
            cellRendererFramework: TextAlignLeftMiddleRenderer
        });
        results.push({
            headerName: "Barcode",
            editable: false,
            width: 1,
            minWidth: 7 * this.emToPxConversionRate,
            field: "barcode",
            cellRendererFramework: TextAlignLeftMiddleRenderer
        });
        results.push({
            headerName: "Cluster Gen Date",
            editable: false,
            width: 1,
            minWidth: 7 * this.emToPxConversionRate,
            field: "createDate",
            cellRendererFramework: DateRenderer,
            dateParser: new DateParserComponent("YYYY-MM-DD", "YYYY-MM-DD")
        });
        results.push({
            headerName: "Sequencing Protocol",
            editable: false,
            width: 300,
            minWidth: 12 * this.emToPxConversionRate,
            field: "idNumberSequencingCyclesAllowed",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.sequenceProtocolsList,
            selectOptionsDisplayField: "name",
            selectOptionsValueField: "idNumberSequencingCyclesAllowed",
            showFillButton: true,
            fillGroupAttribute: 'idRequest'
        });
        results.push({
            headerName: "Content",
            editable: false,
            width: 800,
            minWidth: 8 * this.emToPxConversionRate,
            field: "notes",
            cellRendererFramework: TextAlignLeftMiddleRenderer
        });

        return results;
    }

    public get isRowSelected(): boolean {
        return this.selectedFlowCell && this.selectedFlowCell.number;
    }


    private workItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private changedRowMap: Map<string, any> = new Map<string, any>();
    public label:string = "Flow Cells";
    private searchText: string;
    private dirty: boolean = false;
    private gridApi:GridApi;
    public filterForm: FormGroup;
    private selectedFlowCell: any;


    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                @Inject(DOCUMENT) private document: Document,
                public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                public constService:ConstantsService ) {

        this.filterForm = fb.group({ date: ['', [ Validators.required ]], });
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED).filter((proto) => {
            return proto.isActive === 'Y'
                && (proto.codeRequestCategory ===  "HISEQ"
                    || proto.codeRequestCategory === "MISEQ"
                    || proto.codeRequestCategory === "NOSEQ"
                    || proto.codeRequestCategory === "ILLSEQ");
        });
    }

    initialize() {
        this.dialogsService.startDefaultSpinnerDialog();

        let params: HttpParams = new HttpParams();
        if (this.filterForm.controls['date'].value) {
            let dateRange: DateRange = this.filterForm.controls['date'].value;
            if (dateRange.from && dateRange.to) {
                params = params.set("createDateFrom", dateRange.from.toLocaleDateString());
                params = params.set("createDateTo", dateRange.to.toLocaleDateString());
            }
        }

        this.workflowService.getFlowCellList(params).subscribe((response: any) => {
            if (response && response.result !== "INVALID") {
                this.workItemList = response ? UtilService.getJsonArray(response, response.FlowCell) : [];

                this.gridApi.setRowData(this.workItemList);
                this.gridApi.sizeColumnsToFit();

                if(this.searchText){
                    this.gridApi.setQuickFilter(this.searchText);
                }
            }

            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }


    public dateRangeChange(event: DateRange): void {
        this.filterForm.controls['date'].setValue(event);
        this.initialize();
    }

    public onFind(event?: any): void {
        this.initialize();
    }

    public search(): void {
        this.gridApi.setQuickFilter(this.searchText);
    }

    public onClickPrepReport(): void {
        let url: string = this.document.location.href;
        url = url.substring(0,url.lastIndexOf('/'));
        url += "/ShowFlowCellPrepForm.gx?idFlowCell=" + this.selectedFlowCell.idFlowCell;
        window.open(url, "_blank");
    }

    public onClickRunReport(): void {
        let url: string = this.document.location.href;
        url = url.substring(0,url.lastIndexOf('/'));
        url += "/ShowFlowCellForm.gx?idFlowCell=" + this.selectedFlowCell.idFlowCell;
        window.open(url, "_blank");
    }

    public onClickEditFlowCell(): void {
        let editFlowCell: any;

        let params: HttpParams = new HttpParams().set("id", this.selectedFlowCell.idFlowCell);
        this.workflowService.getFlowCell(params).subscribe((response: any) => {
            editFlowCell = response;

            let config: MatDialogConfig = new MatDialogConfig();
            config.width = "60em";
            config.height = "50em";
            config.data = { flowCell: editFlowCell.FlowCell };

            let actionConfig: any = {
                actions: [
                    {
                        type: ActionType.PRIMARY,
                        icon: this.constService.ICON_SAVE,
                        name: "Save",
                        internalAction: "saveFlowCell"
                    },
                    {
                        type: ActionType.SECONDARY,
                        name: "Cancel",
                        internalAction: "onClose"
                    }
                ]
            };

            this.dialogsService.genericDialogContainer(EditFlowcellDialogComponent, null, null, config, actionConfig).subscribe((result: any) => {
                if(result) {
                    this.searchText = "";
                    this.initialize();
                }
            });
        }, (err: IGnomexErrorResponse) => {
        });
    }

    public launchEditFlowCell(event?: any): void {
        this.onClickEditFlowCell();
    }


    public onRowSelected(event: any): void {
        if(event.node.selected) {
            this.selectedFlowCell = event.data;
        }
    }

    public onCellValueChanged(event: any): void {
        this.changedRowMap.set(event.data.key, event.data);
        this.dirty = true;
    }

    public onGridReady(event: any): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            this.gridApi = event.api;
            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.sizeColumnsToFit();

            this.gridApi.hideOverlay();
        }
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }
}
