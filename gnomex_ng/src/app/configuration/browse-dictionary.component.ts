import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";

import {ITreeOptions, TreeComponent, TreeNode} from "angular-tree-component";
import {Dictionary} from "./dictionary.interface";
import {DictionaryEntry} from "./dictionary-entry.type";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridApi, GridReadyEvent, SelectionChangedEvent} from "ag-grid-community";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {ValueFormatterParams} from "ag-grid-community/dist/lib/entities/colDef";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignLeftMiddleEditor} from "../util/grid-editors/text-align-left-middle.editor";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {ConstantsService} from "../services/constants.service";
import {CellRendererValidation} from "../util/grid-renderers/cell-renderer-validation";

@Component({
    selector: "browse-dictionary",
    template: `
        <div class="flex-container-row double-padded-left-right full-height full-width">
            <div class="full-height panel">
                <div class="flex-container-row justify-space-between align-center tree-row">
                    <label>Dictionaries</label>
                    <div>
                        <button mat-button (click)="refreshAll()"><img [src]="'./assets/refresh.png'" class="button-image"></button>
                        <button mat-button [disabled]="!this.selectedDictionary && !this.selectedEntry" (click)="addEntry()">
                            <img [src]="!this.selectedDictionary && !this.selectedEntry ? './assets/add_disable.png' : './assets/add.png'" class="button-image">
                        </button>
                        <button mat-button [disabled]="!this.selectedEntry" (click)="deleteEntry()">
                            <img [src]="!this.selectedEntry ? './assets/delete_disable.png' : './assets/delete.png'" class="button-image">
                        </button>
                    </div>
                </div>
                <div class="flex-container-row align-center tree-row">
                    <mat-form-field class="flex-one">
                        <input matInput placeholder="Search" [(ngModel)]="this.searchText" (keydown.enter)="searchDictionary()">
                    </mat-form-field>
                    <div>
                        <button mat-button (click)="searchDictionary()"><img [src]="'./assets/magnifier.png'" class="button-image"></button>
                        <button mat-button (click)="clearSearch()"><img [src]="'./assets/cross.png'" class="button-image"></button>
                    </div>
                </div>
                <div class="tree-container">
                    <tree-root #treeComponent
                               (activate)="this.selectTreeItem($event)"
                               [nodes]="this.dictionaries"
                               [options]="this.treeOptions">
                        <ng-template #treeNodeTemplate let-node>
                            <div class="tree-node-font">
                                <img src="{{node.data.icon}}" class="tree-node-icon icon">
                                <span>{{node.data.display}}</span>
                            </div>
                        </ng-template>
                    </tree-root>
                </div>
            </div>
            <div class="full-height flex-container-col detail-view extra-padded">
                <div class="flex-container-row justify-space-between" [hidden]="!this.dictionaryName">
                    <div [hidden]="!this.dictionaryName">
                        <label>{{this.dictionaryName}}</label>
                    </div>
                    <div>
<!--                        <button mat-button [hidden]="!dictionaryEditable || isEditMode" (click)="changeMode()">-->
                        <button mat-button [hidden]="!dictionaryEditable" (click)="changeMode()">
                            <img *ngIf="!isEditMode" class="icon" [src]="this.constService.ICON_TAG_BLUE_EDIT">
                            <img *ngIf="isEditMode" class="icon" [src]="this.constService.PAGE">
                            {{isEditMode ? "View" : "Edit"}}
                        </button>
                    </div>
                </div>
                <div class="flex-container-row extra-padded-top justify-space-between" [hidden]="!dictionaryEditable || !this.isEditMode">
                    <div class="flex-grow">
                        <button mat-button class="padded-right" (click)="onAddRow()">
                            <img class="icon" [src]="this.constService.ICON_ADD" alt="">
                            Add Row
                        </button>
                        <button mat-button class="padded-right" (click)="onRemoveRows()" [disabled]="selectedRows.length < 1">
                            <img class="icon" [src]="this.constService.ICON_DELETE" alt="">
                            Remove Rows
                        </button>
                    </div>
<!--                    <button mat-button (click)="changeMode()">-->
<!--                        <img class="icon" [src]="this.constService.PAGE">-->
<!--                        {{isEditMode ? "View" : "Edit"}}-->
<!--                    </button>-->
                </div>
                <div [hidden]="!this.selectedDictionary" class="flex-one {{isEditMode ? '' : 'extra-padded-top' }}">
                    <ag-grid-angular class="ag-theme-balham full-height full-width"
                                     (gridReady)="this.onGridReady($event)"
                                     [enableFilter]="dictionaryFilterable"
                                     (selectionChanged)="onSelectionChanged($event)"
                                     [rowSelection]="'multiple'"
                                     [rowDeselection]="true"
                                     [stopEditingWhenGridLosesFocus]="true"
                                     (rowDataChanged)="onRowDataChanged($event)"
                                     (cellValueChanged)="onCellValueChanged($event)"
                                     (cellFocused)="onCellFocused($event)"
                                     [enableSorting]="true"
                                     [enableColResize]="true">
                    </ag-grid-angular>
                </div>
                <form [hidden]="!this.selectedEntry" class="flex-one overflow-auto extra-padded-top" [formGroup]="this.entryForm">
                    <ng-container *ngFor="let field of this.visibleEntryFields">
                        <div [ngSwitch]="field.dataType" class="full-width">
                            <mat-form-field *ngSwitchCase="'text'" class="full-width">
                                <input matInput [placeholder]="field.caption" [formControlName]="field.dataField">
                            </mat-form-field>
                            <mat-form-field *ngSwitchCase="'textArea'" class="full-width">
                                <textarea matInput [placeholder]="field.caption" [formControlName]="field.dataField"
                                          matTextareaAutosize matAutosizeMinRows="5" matAutosizeMaxRows="5"></textarea>
                            </mat-form-field>
                            <custom-combo-box *ngSwitchCase="'comboBox'" class="full-width" [placeholder]="field.caption"
                                              [options]="field.options" valueField="value" displayField="display"
                                              [formControlName]="field.dataField">
                            </custom-combo-box>
                            <custom-combo-box *ngSwitchCase="'isActive'" class="full-width" [placeholder]="field.caption"
                                              [options]="field.options" valueField="value" displayField="display"
                                              [formControlName]="field.dataField">
                            </custom-combo-box>
                            <mat-checkbox *ngSwitchCase="'YN'" [formControlName]="field.dataField">{{field.caption}}</mat-checkbox>
                            <mat-form-field *ngSwitchCase="'date'" class="full-width">
                                <input matInput [matDatepicker]="datePicker" [placeholder]="field.caption" [formControlName]="field.dataField">
                                <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                                <mat-datepicker #datePicker [disabled]="false"></mat-datepicker>
                            </mat-form-field>
                        </div>
                    </ng-container>
                </form>
                <div class="full-width" *ngIf="!this.isDialog" [hidden]="!this.selectedEntry">
                    <save-footer [disableSave]="this.entryForm.invalid || !this.selectedEntry || !this.entryForm.dirty"
                                 [showSpinner]="this.showSpinner" (saveClicked)="this.save()" [dirty]="this.entryForm.dirty">
                    </save-footer>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .extra-padded {
            padding: 1em;
        }
        .extra-padded-top {
            padding-top: 1em;
        }
        .flex-one {
            flex: 1;
        }
        .double-padded-left-right {
            padding: 0.3em 0.6em 0.3em 0.6em;
        }
        img.button-image {
            height: 16px;
            width: 16px;
        }
        div.tree-row {
            height: 3em;
        }
        div.tree-container {
            height: calc(100% - 7em);
            min-height: 10em;
        }
        div.panel {
            width: 25%;
            min-width: 23em;
        }
        div.detail-view {
            width: 75%;
            min-width: 50em;
        }
    `],
})

export class BrowseDictionaryComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

    @ViewChild("treeComponent") private treeComponent: TreeComponent;
    public treeOptions: ITreeOptions = {
        displayField: "display",
        childrenField: "DictionaryEntry",
        useVirtualScroll: true,
        nodeHeight: 22,
    };

    public dictionaries: Dictionary[] = [];
    public selectedTreeNode: ITreeNode = null;
    public selectedDictionary: Dictionary = null;
    public selectedEntry: DictionaryEntry = null;
    public dictionaryName: string = "";
    public searchText: string = "";
    public dictionaryEditable: boolean = false;
    public isEditMode: boolean = true;  // TODO: need to fix as false
    public dictionaryFilterable: boolean = false;
    public selectedRows: any[] = [];

    public entryForm: FormGroup;
    public entryFields: any[] = [];
    public visibleEntryFields: any[] = [];
    public showSpinner: boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;
    private isDialog: boolean = false;
    private preSelectedDictionary: any[] = [];
    private preSelectedEntry: string = "";

    private cachedMetaDataClassName: string = "";
    private cachedMetaDataFields: any[] = [];
    private changedRowDataMap: Map<string, any> = new Map<string, any>();

    private gridApi: GridApi;
    private gridDataDirty: boolean = false;

    private optionsYN: any[] = [
        {value: "Y", display: "Yes"},
        {value: "N", display: "No"}
        ];


    constructor(private dialogRef: MatDialogRef<BrowseDictionaryComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dictionaryService: DictionaryService,
                private changeDetector: ChangeDetectorRef,
                private securityAdvisor: CreateSecurityAdvisorService,
                private utilService: UtilService,
                public constService: ConstantsService,
                private dialogsService: DialogsService) {
        super();
        if(this.data && Object.keys(this.data).length > 0) {
            this.isDialog = this.data.isDialog;
            this.preSelectedDictionary = Array.isArray(this.data.preSelectedDictionary) ? this.data.preSelectedDictionary : [this.data.preSelectedDictionary];
            this.preSelectedEntry = this.data.preSelectedEntry;
            this.dictionaryEditable = this.data.dictionaryEditable ? this.data.dictionaryEditable : false;
        }
    }


    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.entryForm = new FormGroup({});
        this.buildTree();
        this.entryForm.markAsPristine();
        this.dictionaryFilterable = this.dictionaryEditable ? true : false;
        this.primaryDisable = (action) => {
            if(this.selectedDictionary) {
                return !this.dictionaryEditable || !this.gridDataDirty; //TODO: or if the grid is invalid.
            } else {
                return this.entryForm.invalid || !this.selectedEntry || !this.entryForm.dirty;
            }
        };
        this.dirty = () => this.selectedDictionary ? this.gridDataDirty : this.entryForm.dirty;

        if(this.isDialog) {
            setTimeout(() => {
                let node: ITreeNode;
                node = this.findNodeByIdAndClassName((Array.isArray(this.preSelectedDictionary) ? this.preSelectedDictionary[0] : [this.preSelectedDictionary][0]), this.preSelectedEntry);
                if (node) {
                    node.setIsActive(true);
                    node.scrollIntoView();
                }
            });
        }

    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetector);
    }

    public changeMode() {
        if(this.isEditMode) {
            this.isEditMode = false;
        } else {
            this.isEditMode = true;
        }
        for(let dictionaryColDef of this.dictionaryColDefs) {
            dictionaryColDef.editable = this.isEditMode;
        }
        if(this.gridApi) {
            setTimeout(() => {
                this.gridApi.setColumnDefs(this.dictionaryColDefs);
                // this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
                this.gridApi.redrawRows();
                this.gridApi.redrawRows({rowNodes: this.gridApi.getSelectedNodes()});
                this.gridApi.sizeColumnsToFit();
            });
        }
    }

    public onSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedRows = event.api.getSelectedRows();
    }

    public onRowDataChanged(event: any): void {
        if(this.gridApi) {
            console.log(event);
        }
    }

    public onCellFocused(event: any): void {
        for (let instance of event.api.getCellRendererInstances({ rowNodes: [this.gridApi.getRowNode(event.rowIndex) ]})) {
            if (instance._componentRef.instance instanceof CellRendererValidation) {
                instance._componentRef.instance.updateValidation();
            }
        }
    }

    public onCellValueChanged(event: any): void {
        if(event.colDef.field === "sortOrder") {
            //FixMe: validator required
            // let errorMessage: string = event.colDef.field + " expects a numeric";
            // event.colDef.validators = [Validators.pattern(/^\d{1,10}$/)];
            // event.colDef.errorNameErrorMessageMap = [{errorName: "pattern", errorMessage: errorMessage}];
            // event.colDef.setErrors = (value: any, data: any, node: any, colDef: any, rowIndex: any, gridApi: any) => {
            //     return (value && value.match(/^d{0,10}$/)) ? "" : event.colDef.field + " expects a numeric";
            // };
            // console.log(event.colDef.setErrors(event.newValue, event.data, event.node, event.colDef, event.rowIndex, this.gridApi) === true);
            // if(event.colDef.setErrors(event.newValue, event.data, event.node, event.colDef, event.rowIndex, this.gridApi)) {
            //     return;
            // }
        }

        // if(event.newValue !== event.oldValue) {
            this.changedRowDataMap.set(event.data.datakey, event.data);
            this.gridDataDirty = true;
        // }
    }

    public onAddRow(): void {
        if(!this.selectedDictionary) {
            return;
        }

        let template = this.selectedRows.length > 0 ? this.selectedRows[0] : this.selectedDictionary.DictionaryEntry.length > 0 ? this.selectedDictionary.DictionaryEntry[0] : null;
        let newEntry = {
            canDelete: template && template.canDelete ? template.canDelete : "",
            canRead: template && template.canRead ? template.canRead : "",
            canWrite: template && template.canWrite ? template.canWrite : "",
            canUpdate: template && template.canUpdate ? template.canUpdate : "",
            display: "",
            value: "",
            datakey: "",
            action: "add"
        };

        this.selectedDictionary.DictionaryEntry.push(newEntry);
        this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
        this.gridApi.redrawRows();

        this.gridApi.deselectAll();
        let rowIndex  = "" + this.selectedDictionary.DictionaryEntry.indexOf(newEntry);
        this.gridApi.getRowNode(rowIndex).setSelected(true);
        this.gridApi.setFocusedCell(this.gridApi.getRowNode(rowIndex).rowIndex, "name");
        this.gridApi.ensureIndexVisible(this.gridApi.getRowNode(rowIndex).rowIndex, "bottom");
        this.gridDataDirty = true;
    }

    public onRemoveRows(): void {
     if(this.selectedRows.length > 0) {
         for(let selectedRow of this.selectedRows) {
             this.selectedDictionary.DictionaryEntry.splice(this.selectedDictionary.DictionaryEntry.indexOf(selectedRow), 1)
             selectedRow.action = "delete";
             this.changedRowDataMap.set(selectedRow.datakey, selectedRow);
         }
         this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
         this.gridDataDirty = true;

         this.selectedRows = [];
         this.gridApi.deselectAll();
     }
    }

    private buildTree(): void {
        let dictionariesTemp: Dictionary[] = this.dictionaryService.getEditableDictionaries();
        this.preSelectedDictionary = Array.isArray(this.preSelectedDictionary) ? this.preSelectedDictionary : [this.preSelectedDictionary];
        if(this.isDialog) {
            dictionariesTemp = dictionariesTemp.filter((value: Dictionary) => {
                for(let dictionary of this.preSelectedDictionary) {
                    if(value.className === dictionary) {
                        return true;
                    }
                }
            });
        }
        for (let dictionary of dictionariesTemp) {
            dictionary.display = dictionary.displayName;
            dictionary.icon = "./assets/folder.png";
            dictionary.DictionaryEntry = this.dictionaryService.getEntriesExcludeBlank(dictionary.className);
            for (let entry of (dictionary.DictionaryEntry as DictionaryEntry[])) {
                entry.icon = "./assets/page_white.png";
            }
        }
        dictionariesTemp.sort((a: Dictionary, b:Dictionary) => {
            return a.display.toUpperCase().localeCompare(b.display.toUpperCase());
        });
        dictionariesTemp = this.restrictCoreFacilityVisibility(dictionariesTemp);
        this.dictionaries = dictionariesTemp;
    }

    private restrictCoreFacilityVisibility(dictionariesTemp: Dictionary[]): Dictionary[] {
        // If user is an admin, restrict visibility of any dictionary / dictionary entry related
        // to a core other than what they manage
        if (this.securityAdvisor.isAdmin && !this.securityAdvisor.isSuperAdmin) {
            let coreFacilities: DictionaryEntry[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY);
            let dnaSeqCore: DictionaryEntry = coreFacilities.find((entry: DictionaryEntry) => (entry.display.includes("DNA Sequencing")));
            let molecDiagCore: DictionaryEntry = coreFacilities.find((entry: DictionaryEntry) => (entry.display.includes("Molecular Diagnostics")));

            return dictionariesTemp.filter((dict: Dictionary) => {
                if ((dict.display.includes("DNA Seq Core") && dnaSeqCore && !this.securityAdvisor.isCoreFacilityIManage(dnaSeqCore.value)) ||
                    (dict.display.includes("Molecular Diagnostics") && molecDiagCore && !this.securityAdvisor.isCoreFacilityIManage(molecDiagCore.value))) {
                    return false;
                }

                dict.DictionaryEntry = (dict.DictionaryEntry as any[]).filter((entry: any) => {
                    if (entry.idCoreFacility) {
                        return this.securityAdvisor.isCoreFacilityIManage(entry.idCoreFacility);
                    }
                    return true;
                });

                return true;
            });
        } else {
            return dictionariesTemp;
        }
    }

    public selectTreeItem(event: any): void {
        this.selectedDictionary = null;
        this.selectedEntry = null;
        this.changedRowDataMap = new Map<string, any>();

        this.selectedTreeNode = event.node;
        let selectedData: any = JSON.parse(JSON.stringify(this.selectedTreeNode.data));
        if (!this.selectedTreeNode.hasChildren) {
            this.selectEntry(selectedData);
            this.dictionaryName = this.selectedTreeNode.parent.data.display;
        } else {
            this.selectDictionary(selectedData);
            this.selectedTreeNode.expand();
            this.dictionaryName = this.selectedTreeNode.data.display;
        }
    }

    private selectDictionary(dict: any): void {
        this.selectedDictionary = dict;
        if (this.cachedMetaDataClassName === dict.className) {
            this.prepareGrid();
        } else {
            this.gatherMetaData(dict.className, () => {
                this.prepareGrid();
            });
        }
    }

    private gatherMetaData(className: string, callback?: () => void | null): void {
        this.dictionaryService.getMetaData(className).subscribe((response: any) => {
            if (response && response.Dictionary) {
                this.cachedMetaDataClassName = response.Dictionary.className;
                this.cachedMetaDataFields = Array.isArray(response.Dictionary.Field) ? response.Dictionary.Field : [response.Dictionary.Field.Field];
                if (callback) {
                    callback();
                }
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }

    private dictionaryColDefs: any[] = [];

    private prepareGrid(): void {
        let colDefs: any[] = [];
        for (let field of this.cachedMetaDataFields) {
            if (field.visible === 'Y') {
                //TODO: Validation needed. Adding validators here causes a slow down of loading
                let colDef: any = {
                    headerName: field.caption, headerTooltip: field.caption, field: field.dataField,
                    tooltipField: field.dataField, editable: this.dictionaryEditable && this.isEditMode,
                    isIdentifier: field.isIdentifier
                };
                if (field.dataType === "comboBox") {
                    if(this.dictionaryEditable && this.isEditMode) {
                        colDef.cellRendererFramework = SelectRenderer;
                        colDef.cellEditorFramework = SelectEditor;
                        colDef.delayValidation = true;
                        colDef.selectOptions = this.dictionaryService.getEntriesExcludeBlank(field.className);
                        colDef.selectOptionsDisplayField = "display";
                        colDef.selectOptionsValueField = "value";
                    } else {
                        colDef.valueFormatter = this.optionsFieldValueFormatter;
                        colDef.comboBoxOptions = this.dictionaryService.getEntriesExcludeBlank(field.className);
                    }
                } else if(field.dataType === "text") {
                    colDef.cellRendererFramework = TextAlignLeftMiddleRenderer;
                    colDef.cellEditorFramework = TextAlignLeftMiddleEditor;
                    colDef.validators = [
                        Validators.required,
                        Validators.pattern(/^\d{1,10}$/)
                    ];
                    colDef.errorNameErrorMessageMap = [
                        { errorName: 'required', errorMessage: 'Multiplex Group required' },
                        { errorName: 'pattern',  errorMessage: 'Expects an integer number' }
                    ];
                    colDef.validateOnlyRenderedCells = true;
                } else if(field.dataType === "isActive" || field.dataType === "YN") {
                    if (this.dictionaryEditable && this.isEditMode) {
                        colDef.cellRendererFramework = SelectRenderer;
                        colDef.cellEditorFramework = SelectEditor;
                        colDef.selectOptions = this.optionsYN;
                        colDef.selectOptionsDisplayField = "value";
                        colDef.selectOptionsValueField = "value";
                    }
                }

                colDefs.push(colDef);
            }
        }

        this.dictionaryColDefs = colDefs; // used for changing mode, may not work
        this.gridApi.setColumnDefs(colDefs);
        //TODO: need to ordered first by "oligo barcode scheme" and then by barcode sort order. Brian's request
        this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
        this.gridApi.sizeColumnsToFit();
    }

    private optionsFieldValueFormatter(params: ValueFormatterParams): any {
        if (!params.value) {
            return "";
        }
        let option: DictionaryEntry = ((params.colDef as any).comboBoxOptions as DictionaryEntry[]).find((entry: DictionaryEntry) => (entry.value === params.value));
        if (option) {
            return option.display;
        } else {
            return "";
        }
    }

    private selectEntry(entry: any) {
        this.selectedEntry = entry;
        if (this.cachedMetaDataClassName === this.selectedTreeNode.parent.data.className) {
            this.prepareForm();
        } else {
            this.gatherMetaData(this.selectedTreeNode.parent.data.className, () => {
                this.prepareForm();
            });
        }
    }

    private prepareForm(): void {
        this.entryFields = [];
        this.visibleEntryFields = [];
        this.entryForm = new FormGroup({});
        let isInsertMode: boolean = !this.selectedEntry.value;
        for (let field of this.cachedMetaDataFields) {
            let entryField: any = {
                dataField: field.dataField, dataType: field.dataType, caption: field.caption, isIdentifier: field.isIdentifier,
                value: BrowseDictionaryComponent.getFieldAsString(this.selectedEntry, field.dataField), visible: field.visible
            };
            if (field.dataType === "text" && field.length >= 50) {
                entryField.dataType = "textArea";
            }
            if (field.dataType === "comboBox") {
                entryField.options = this.dictionaryService.getEntriesExcludeBlank(field.className);
            }
            if(field.dataType === "isActive") {
                entryField.options = this.optionsYN;
            }
            if (field.dataType === "YN") {
                this.entryForm.addControl(entryField.dataField, new FormControl(entryField.value === 'Y'));
            } else if (field.dataType === 'date') {
                this.entryForm.addControl(entryField.dataField, new FormControl(entryField.value ? new Date(entryField.value) : ""));
                this.entryForm.get(entryField.dataField).disable();
            } else {
                this.entryForm.addControl(entryField.dataField, new FormControl(entryField.value));
            }
            if(field.visible === "Y" && field.dataField === "sortOrder") {
                this.entryForm.get(entryField.dataField).setValidators(Validators.pattern(/^\d{0,10}$/));
            }
            if (field.visible !== 'Y' || (field.isIdentifier && field.isIdentifier === "Y" && !isInsertMode)) {
                this.entryForm.get(entryField.dataField).disable();
            }
            this.entryFields.push(entryField);
            if (field.visible === 'Y') {
                this.visibleEntryFields.push(entryField);
            }
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    public searchDictionary(): void {
        let formattedSearchText: string = this.searchText.toUpperCase();
        this.treeComponent.treeModel.filterNodes((node: TreeNode) => {
            return node.data.display.toUpperCase().includes(formattedSearchText) ||
                (node.data.propertyValue && node.data.propertyValue.toUpperCase().includes(formattedSearchText)) ||
                (node.data.propertyDescription && node.data.propertyDescription.toUpperCase().includes(formattedSearchText));
        }, false);
    }

    public clearSearch(): void {
        this.searchText = "";
        this.treeComponent.treeModel.clearFilter();
    }

    public save(): void {
        if (this.selectedEntry && !this.entryForm.invalid && this.entryForm.dirty) {
            let isInsertMode: boolean = !this.selectedEntry.value;
            this.showSpinner = true;
            let dataKeyField: string;
            let dataKeyValue: string;

            let object: HttpParams = new HttpParams();
            for (let field of this.entryFields) {
                let value: string;
                if (field.dataType === "YN") {
                    value = this.entryForm.get(field.dataField).value ? "Y" : "N";
                } else if (field.dataType === 'date' && this.entryForm.get(field.dataField).value) {
                    let date: Date = this.entryForm.get(field.dataField).value;
                    let month: string = "" + (date.getMonth() + 1);
                    let day: string = "" + date.getDate();
                    let year: string = "" + date.getFullYear();
                    value = month + "/" + day + "/" + year;
                } else {
                    value = this.entryForm.get(field.dataField).value;
                }
                object = object.set(field.dataField, value);

                if (!isInsertMode && field.isIdentifier && field.isIdentifier === "Y" && field.dataField !== "display") {
                    dataKeyField = field.dataField;
                    dataKeyValue = this.entryForm.get(field.dataField).value;
                }
            }

            let className: string = this.selectedTreeNode.data.className ? this.selectedTreeNode.data.className : this.selectedTreeNode.parent.data.className;
            this.dictionaryService.save(isInsertMode, object, className, () => {
                this.buildTree();
                this.showSpinner = false;
                setTimeout(() => {
                    for (let dict of this.treeComponent.treeModel.roots) {
                        if (dict.data.className === className) {
                            dict.expand();
                            if (isInsertMode) {
                                dict.toggleActivated(null);
                            } else {
                                for (let entry of dict.children) {
                                    if (entry.data[dataKeyField] === dataKeyValue) {
                                        entry.toggleActivated(null);
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                });
            }, () => {
                this.showSpinner = false;
                this.dialogsService.error("An error occurred while saving dictionary");
            });
        } else if(this.selectedDictionary && this.dirty) {
            this.showSpinner = true;
            let dictionaryEntries: any[] = [];
            for(let value of Array.from(this.changedRowDataMap.values())) {
                dictionaryEntries.push(value);
            }
            let savedDictionaryEntries: any[] = [];
            let className: string = this.selectedDictionary.className;
            let entryCount: number = 0;
            // let savedDictionaryEntriesMap: Map<string, any> = new Map<string, any>();
            for(let entry of dictionaryEntries) {
                let entryObject: HttpParams = new HttpParams();
                // Get fields of the entry
                if(entry && typeof entry === "object") {
                    Object.keys(entry).forEach(key => {
                        for (let field of this.cachedMetaDataFields) {
                            if (key === field.dataField) {
                                entryObject = entryObject.set(key, entry[key]);
                                break;
                            }
                        }
                    });
                }
                let action: string = entry.action ? entry.action : "save";
                // savedDictionaryEntriesMap.set(action, entryObject);
                savedDictionaryEntries.push({
                    action: action,
                    object: entryObject
                });
            }


            if(savedDictionaryEntries.length > 0) {
                // this.showSpinner = true;
                this.dictionaryService.saveDictionaries(savedDictionaryEntries, className, () => {
                    //Succeed
                    entryCount++;
                    if(entryCount === dictionaryEntries.length) {
                        this.changedRowDataMap = new Map<string, any>();
                        this.buildTree();
                        this.showSpinner = false;
                        setTimeout(() => {
                            for(let dict of this.treeComponent.treeModel.roots) {
                                if(dict.data.className === className) {
                                    dict.expand();
                                    dict.toggleActivated(null);
                                    this.gridDataDirty = false;
                                }
                            }
                        });
                    }
                }, () => {
                    //Error
                    this.showSpinner = false;
                    this.dialogsService.error("An error occurred while saving dictionary");
                });
            } else {
                this.showSpinner = false;
            }

        }
    }

    public addEntry(): void {
        if (!this.selectedDictionary && !this.selectedEntry) {
            return;
        }

        this.selectedDictionary = null;
        this.selectedEntry = {
            canDelete: "",
            canRead: "",
            canWrite: "",
            canUpdate: "",
            display: "",
            value: "",
            datakey: ""
        };
        this.prepareForm();
    }

    public deleteEntry(): void {
        if (!this.selectedEntry) {
            return;
        }
        let className: string = this.selectedTreeNode.data.className ? this.selectedTreeNode.data.className : this.selectedTreeNode.parent.data.className;
        if (!this.selectedEntry.value) {
            this.selectedEntry = null;
            this.selectDictionaryInTree(className);
            return;
        }

        this.showSpinner = true;
        let object: HttpParams = new HttpParams();
        for (let field of this.entryFields) {
            let value: string = "";
            if (field.isIdentifier === "Y") {
                value = this.entryForm.get(field.dataField).value;
            }
            object = object.set(field.dataField, value);
        }
        this.dictionaryService.delete(object, className, () => {
            this.buildTree();
            this.showSpinner = false;
            setTimeout(() => {
                this.selectDictionaryInTree(className);
            });
        }, () => {
            this.showSpinner = false;
            this.dialogsService.error("An error occurred while deleting dictionary");
        });
    }

    private selectDictionaryInTree(className: string): void {
        if (this.treeComponent.treeModel.getActiveNode()) {
            this.treeComponent.treeModel.getActiveNode().toggleActivated(null);
        }
        for (let dict of this.treeComponent.treeModel.roots) {
            if (dict.data.className === className) {
                dict.expand();
                dict.toggleActivated(null);
                break;
            }
        }
    }

    public refreshAll(): void {
        this.selectedDictionary = null;
        this.selectedEntry = null;
        this.dialogsService.addSpinnerWorkItem();
        this.dictionaryService.reloadAndRefresh(() => {
            this.buildTree();
            this.dialogsService.removeSpinnerWorkItem();
        }, () => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    private static getFieldAsString(obj: any, field: string): string {
        return (obj && obj[field]) ? obj[field] : "";
    }

    public cancel(): void {
        this.dialogRef.close();
    }

    private findNodeByIdAndClassName(className: string, id?: string): ITreeNode {
        if (this.treeComponent.treeModel && this.treeComponent.treeModel.roots) {
            for (let dict of this.treeComponent.treeModel.roots) {
                if(dict.data.className === className) {
                    dict.expand();
                    if(dict.hasChildren && id) {
                        for(let entry of dict.children) {
                            if (entry.data.value === id) {
                                return entry;
                            }
                        }
                    } else {
                        return dict;
                    }
                }
            }
        }
        return null;
    }

}
