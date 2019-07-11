import {Component, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {ConstantsService} from "../services/constants.service";
import {DictionaryService} from "../services/dictionary.service";
import {GridApi, GridReadyEvent, RowSelectedEvent} from "ag-grid-community";
import {CheckboxRenderer} from "./grid-renderers/checkbox.renderer";
import {DialogsService, DialogType} from "./popup/dialogs.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";

@Component({
    selector: "edit-institutions",
    template: `
        <div class="content-div">
            <div class="flex-container-row align-center">
                <button mat-button (click)="this.addInstitution()">
                    <img [src]="this.constantsService.PAGE_ADD" class="icon">Add Institution
                </button>
                <button mat-button [disabled]="!this.selectedInstitution" (click)="this.removeInstitution()">
                    <img [src]="this.constantsService.PAGE_REMOVE" class="icon">Remove Institution
                </button>
            </div>
            <div class="flex-grow">
                <ag-grid-angular class="full-height full-width ag-theme-balham"
                                 [stopEditingWhenGridLosesFocus]="true"
                                 [singleClickEdit]="true"
                                 [columnDefs]="this.columnDefs"
                                 [rowSelection]="'single'"
                                 (cellValueChanged)="this.onCellValueChanged()"
                                 (rowSelected)="this.onGridRowSelected($event)"
                                 (gridReady)="this.onGridReady($event)">
                </ag-grid-angular>
            </div>
        </div>
    `,
    styles: [`
        div.content-div {
            display: flex !important;
            flex-direction: column;
            height: 20em;
            width: 40em;
        }
    `]
})

export class EditInstitutionsComponent extends BaseGenericContainerDialog implements OnInit {

    public isDirty: boolean = false;
    public columnDefs: any[];
    public institutions: any[] = [];
    public selectedInstitution: any = null;

    private gridApi: GridApi;

    constructor(public constantsService: ConstantsService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private dialogRef: MatDialogRef<EditInstitutionsComponent>) {
        super();
    }

    ngOnInit(): void {
        this.institutions = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.INSTITUTION);
        this.columnDefs = [
            {
                headerName: "Institution",
                editable: true,
                field: "institution",
                width: 300,
            },
            {
                headerName: "Description",
                editable: true,
                field: "description",
                width: 300,
            },
            {
                headerName: "Active",
                editable: false,
                field: "isActive",
                cellRendererFramework: CheckboxRenderer,
                checkboxEditable: true,
                width: 100,
            },
        ];

        this.primaryDisable = (action) => !this.isDirty;
    }

    public onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
        this.gridApi.setRowData(this.institutions);
        this.gridApi.sizeColumnsToFit();
    }

    public onGridRowSelected(event: RowSelectedEvent): void {
        this.selectedInstitution = event.data;
    }

    public onCellValueChanged(): void {
        this.isDirty = true;
    }

    private refreshGrid(): void {
        this.gridApi.setRowData(this.institutions);
        this.selectedInstitution = null;
    }

    public addInstitution(): void {
        let newInstitution: any = {
            idInstitution: "",
            institution: "",
            description: "",
            isActive: "Y",
        };
        this.institutions.push(newInstitution);
        this.isDirty = true;
        this.refreshGrid();
    }

    public removeInstitution(): void {
        this.institutions.splice(this.institutions.indexOf(this.selectedInstitution), 1);
        this.isDirty = true;
        this.refreshGrid();
    }

    public save(): void {
        this.showSpinner = true;
        this.dictionaryService.saveInstitutions(this.institutions).subscribe((result: any) => {
            if (result.unremovableInstitutions) {
                this.dialogsService.alert(
                    "The following institutions could not be deleted because they are associated with data: " + result.unremovableInstitutions,
                    "Warning", DialogType.WARNING);
            }
            this.dictionaryService.reloadAndRefresh(() => {
                this.dialogRef.close(true);
            }, () => {
                this.showSpinner = false;
            }, DictionaryService.INSTITUTION);
        }, () => {
            this.showSpinner = false;
        });
    }

}
