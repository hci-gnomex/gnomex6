import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder} from "@angular/forms"
import {PrimaryTab} from "../../../util/tabs/primary-tab.component"
import {ActivatedRoute} from "@angular/router";
import {MatDialogConfig} from "@angular/material";
import {ImportSegmentsDialog} from "./import-segments-dialog";
import {CreateSecurityAdvisorService} from "../../../services/create-security-advisor.service";
import {ConstantsService} from "../../../services/constants.service";
import {GridOptions} from "ag-grid-community";
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {Subscription} from "rxjs";
import {DataTrackService} from "../../../services/data-track.service";
import {DialogsService} from "../../../util/popup/dialogs.service";
import {ActionType} from "../../../util/interfaces/generic-dialog-action.model";


@Component({
    selector: 'gb-segment',
    template: `

        <div style="display:flex; flex-direction:column; height:100%;width:100%;">
            <div style="width:100%;">
                <div class="inline-block"> Segments: {{this.rowData.length }} </div>
                <button [disabled]="!enableNew" mat-button type="button" (click)="newSegments()">
                    <img [src]="this.newSegment"> New
                </button>
            
                <button [disabled]="!enableRemove" mat-button type="button" (click)="removeSegments()">
                    <img [src]="this.removeSegment"> Remove
                </button>
                <button [disabled]="!enableImport" mat-button type="button" (click)="openImportDialog()">
                    <img [src]="this.importSegment"> Import
                </button>
            </div>
            <div style="flex:1; display:flex; width:100%; padding-top: 1em;">
                <ag-grid-angular style="width: 100%;" class="ag-theme-fresh"
                                 [rowData]="rowData"
                                 [columnDefs]="columnDefs"
                                 [rowSelection]="'multiple'"
                                 [enableSorting]="true"
                                 [enableColResize]="true"
                                 (cellEditingStopped)="editStop()"
                                 (gridSizeChanged)="adjustColumnSize($event)"
                                 (rowSelected)="selectedRow($event)"
                                 [rowDeselection]="true"
                                 [gridOptions]="gridOpt">
                </ag-grid-angular>

            </div>


        </div>


    `,
    styles: [`
        .form-field {
            margin-left: 1em;
            margin-right: 1em;
            font-size: 1.1rem;
            width: 30%;
            resize: none;
        }
        .inline-block{
            display: inline-block;
        }
    `]

})
export class GBSegmentsTabComponent extends PrimaryTab implements OnInit, OnDestroy {
    //Override
    name = "Segments";
    private value: number = 0;
    private rowData: Array<any> = [];
    private gridOpt: GridOptions = {};
    private newSegment: string;
    private removeSegment: string;
    private importSegment: string;
    private enableNew: boolean = true;
    private enableRemove: boolean = false;
    private enableImport: boolean = true;
    private validSubscription: Subscription;
    private idGenomeBuild: string = '';
    private datatracksTreeNodeSubscription: Subscription;


    private editable = (): boolean => {
        return !this.secAdvisor.isGuest;
    }
    private importFn = (importValue: Array<any>) => {
        this.rowData = importValue;
    }

    private columnDefs = [
        {
            headerName: "Name",
            editable: this.editable(),
            field: "name",
            width: 100

        },
        {
            headerName: "Length",
            field: "length",
            editable: this.editable(),
            width: 100
        },
        {
            headerName: "Order",
            field: "sortOrder",
            //cellEditorFramework: NumericEditorComponent,
            editable: this.editable(),
            width: 200
        }

    ];


    constructor(protected fb: FormBuilder,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
                private secAdvisor: CreateSecurityAdvisorService,
                private datatracksService: DataTrackService,
                private constService: ConstantsService,
                private gbValidateService: GenomeBuildValidateService) {
        super(fb);
    }

    ngOnInit(): void {

        this.validSubscription = this.gbValidateService.getValidateGenomeBuildObservable() // just subject no async call
            .subscribe(() => {
                this.gbValidateService.segmentValidation(this.rowData);
                this.gbValidateService.segmentsList = this.rowData;
            });

        this.datatracksTreeNodeSubscription = this.datatracksService.datatrackListTreeNodeSubject.subscribe((data)=>{
            if(data){
                let canWrite: boolean = data.canWrite === 'Y';
                this.newSegment = !this.secAdvisor.isGuest && canWrite ? this.constService.SEGMENT_NEW : this.constService.SEGMENT_NEW_DISABLE; // need to add check for canWrite
                this.removeSegment = this.constService.SEGMENT_REMOVE_DISABLE; // need to add check for canWrite below
                this.importSegment = !this.secAdvisor.isGuest ? this.constService.SEGMENT_IMPORT : this.constService.SEGMENT_IMPORT_DISABLE; // need to add check for canWrite

                this.enableNew = canWrite;
                this.enableImport = canWrite;
            }
        });

        this.route.data.forEach(data => { //asynchronous
            this.gbValidateService.resetValidation();
            let segs = Array.isArray(data.genomeBuild.Segments) ? data.genomeBuild.Segments : [data.genomeBuild.Segments];
            this.rowData = segs;
        });
        this.route.params.forEach(params => {
            this.idGenomeBuild = params["idGenomeBuild"];
        });
    }

    adjustColumnSize(event:any){
        if(this.gridOpt.api){
            this.gridOpt.api.sizeColumnsToFit();
        }
    }

    openImportDialog(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.autoFocus = false;
        config.data = {
            importFn: this.importFn,
            idGenomeBuild: this.idGenomeBuild
        }
        this.dialogsService.genericDialogContainer(ImportSegmentsDialog, "Copy/paste segment information", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});
    }

    newSegments() {

        let newRow: any = {name: 'chr?', length: '', sortOrder: "" + (this.rowData.length + 1)};
        this.rowData.push(newRow);
        this.rowData = this.rowData.slice();

    }

    removeSegments() {
        let tmpRowData: Array<any> = [];

        this.gridOpt.api.forEachNode(node=> {
             if(!node.isSelected()){
                tmpRowData.push(node.data);
             }
        });


        this.gbValidateService.dirtyNote = true;
        this.rowData = tmpRowData;

    }

    selectedRow(event: any) {
        // code for remove
        let canWrite: boolean = this.datatracksService.datatrackListTreeNode.canWrite === 'Y';
        let selectedRows: Array<any> = this.gridOpt.api.getSelectedRows();

        if (selectedRows.length === 0 || this.secAdvisor.isGuest || !canWrite) {
            this.enableRemove = false;
            this.removeSegment = this.constService.SEGMENT_REMOVE_DISABLE;
        } else {
            this.enableRemove = true;
            this.removeSegment = this.constService.SEGMENT_REMOVE;
        }
    }

    editStop() {
        this.gbValidateService.dirtyNote = true;
    }

    ngOnDestroy() {
        if (this.validSubscription) {
            this.validSubscription.unsubscribe();
        }
        if(this.datatracksTreeNodeSubscription){
            this.datatracksTreeNodeSubscription.unsubscribe();
        }

    }

}




