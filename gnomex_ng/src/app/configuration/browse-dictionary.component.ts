import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";

import {ITreeOptions, TreeComponent, TreeNode} from "angular-tree-component";
import {Dictionary} from "./dictionary.interface";
import {DictionaryEntry} from "./dictionary-entry.type";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {DateFilter, GridReadyEvent, NumberFilter, SelectionChangedEvent} from "ag-grid-community";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {ValueGetterParams} from "ag-grid-community/src/ts/entities/colDef";
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
                        <button mat-button [disabled]="!this.selectedDictionary && !this.selectedEntry" (click)="addEntry()" matTooltip="Add single dictionary entry">
                            <img [src]="!this.selectedDictionary && !this.selectedEntry ? './assets/add_disable.png' : './assets/add.png'" class="button-image">
                        </button>
                        <button mat-button [disabled]="!this.selectedEntry || this.selectedEntry.canDelete !== 'Y'" (click)="deleteEntry()" matTooltip="Delete single dictionary entry">
                            <img [src]="(!this.selectedEntry || this.selectedEntry.canDelete !== 'Y') ? './assets/delete_disable.png' : './assets/delete.png'" class="button-image">
                        </button>
                    </div>
                </div>
                <div class="flex-container-row align-center tree-row">
                    <mat-form-field class="flex-one">
                        <input matInput placeholder="Search" [(ngModel)]="this.searchText" (keydown.enter)="searchDictionary()">
                    </mat-form-field>
                    <div>
                        <button mat-button (click)="searchDictionary()">
                            <img [src]="'./assets/magnifier.png'" class="button-image">
                        </button>
                        <button mat-button (click)="clearSearch()">
                            <img [src]="'./assets/cross.png'" class="button-image">
                        </button>
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
                    <div [hidden]="!selectedDictionary">
                            <button mat-button [hidden]="!dicGridEditable" (click)="changeMode()">
                                <img *ngIf="!isEditMode" class="icon" [src]="this.constService.ICON_TAG_BLUE_EDIT">
                                <img *ngIf="isEditMode" class="icon" [src]="this.constService.PAGE">
                                {{isEditMode ? "View" : "Edit"}}
                            </button>
                            <button mat-button [hidden]="!dictionaryFilterable || !this.isAnyFilterPresent" (click)="clearFilterModel()">Clear Filter</button>
                    </div>
                </div>
                <div class="flex-container-row extra-padded-top justify-space-between" [hidden]="!dicGridEditable || !selectedDictionary || !isEditMode">
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
                </div>
                <div [hidden]="!this.selectedDictionary"
                     class="flex-one {{dicGridEditable ? '' : 'extra-padded-top' }}">
                    <ag-grid-angular class="ag-theme-balham full-height full-width"
                                     (gridReady)="this.onGridReady($event)"
                                     [enableFilter]="dictionaryFilterable"
                                     (selectionChanged)="onSelectionChanged($event)"
                                     [rowSelection]="this.rowSelectionMode"
                                     [rowDeselection]="true"
                                     [stopEditingWhenGridLosesFocus]="true"
                                     (cellValueChanged)="onCellValueChanged($event)"
                                     (cellFocused)="onCellFocused($event)"
                                     (cellDoubleClicked)="onCellDoubleClicked($event)"
                                     (cellClicked)="onCellClicked($event)"
                                     [singleClickEdit]="isEditMode ? true : false"
                                     [enableSorting]="true"
                                     [enableColResize]="true">
                    </ag-grid-angular>
                </div>
                <form [hidden]="!this.selectedEntry" class="flex-one overflow-auto extra-padded-top" [formGroup]="this.entryForm">
                    <ng-container *ngFor="let field of this.visibleEntryFields">
                        <div [ngSwitch]="field.dataType" class="full-width">
                            <mat-form-field *ngSwitchCase="'text'" class="full-width">
                                <input matInput [placeholder]="field.caption" [formControlName]="field.dataField">
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('maxlength')">
                                    {{field.dataField}} requires a maximum of {{field.dataSize}} characters
                                </mat-error>
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('required')">
                                    {{field.dataField}} is required
                                </mat-error>
                            </mat-form-field>
                            <mat-form-field *ngSwitchCase="'number'" class="full-width">
                                <input matInput [placeholder]="field.caption" [formControlName]="field.dataField">
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('pattern')">
                                    {{field.dataField}} requires an integer number of maximum 10 digits
                                </mat-error>
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('required')">
                                    {{field.dataField}} is required
                                </mat-error>
                            </mat-form-field>
                            <mat-form-field *ngSwitchCase="'textArea'" class="full-width">
                                <textarea matInput [placeholder]="field.caption" [formControlName]="field.dataField"
                                          matTextareaAutosize matAutosizeMinRows="5" matAutosizeMaxRows="5"></textarea>
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('maxlength')">
                                    {{field.dataField}} can be at most {{field.dataSize}} characters
                                </mat-error>
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('required')">
                                    {{field.dataField}} is required
                                </mat-error>
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
                                <mat-error *ngIf="this.entryForm.get(field.dataField).hasError('required')">
                                    {{field.dataField}} is required
                                </mat-error>
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
        .mat-input-element:disabled {
            color: rgba(0,0,0,.78);
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
    public dicGridEditable: boolean = false;
    public isEditMode: boolean = false;
    public dictionaryFilterable: boolean = true;
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

    private gridApi: any;
    private gridDataDirty: boolean = false;

    private dataChanged: boolean = false;
    private addRowIndex: number = 0;
    private optionsYN: any[] = [
        {value: "Y", display: "Yes"},
        {value: "N", display: "No"}
        ];

    public get rowSelectionMode(): string {
        return this.isEditMode ? "multiple" : "single";
    }

    public get isAnyFilterPresent(): boolean {
        return this.gridApi ? this.gridApi.isAnyFilterPresent() : false;
    }

    private get gridValid(): boolean {
        return this.gridApi ? this.gridApi.formGroup.valid : false;
    }

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
            this.dicGridEditable = this.data.dicGridEditable ? this.data.dicGridEditable : false;
        }
    }


    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.entryForm = new FormGroup({});
        this.buildTree();
        this.entryForm.markAsPristine();
        this.primaryDisable = (action) => {
            if(this.selectedDictionary) {
                return !this.dicGridEditable || !this.gridDataDirty || !this.gridValid;
            } else {
                return this.entryForm.invalid || !this.selectedEntry || !this.entryForm.dirty;
            }
        };
        this.dirty = () => this.selectedDictionary ? this.gridDataDirty : this.entryForm.dirty;

        if(this.isDialog) {
            this.dataChanged = false;
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

    public clearFilterModel(): void {
        if(this.gridApi && this.gridApi.isAnyFilterPresent()) {
            this.gridApi.setFilterModel(null);
        }
    }

    public changeMode() {
        if(!this.selectedDictionary) {
            return;
        }

        this.dialogsService.startDefaultSpinnerDialog();

        if(this.gridDataDirty) {
            this.dialogsService.confirm("Your changes haven't been saved. Continue anyway?")
                .subscribe((result: boolean) => {
                    if(result) {
                        this.isEditMode = !this.isEditMode;
                        this.selectedRows = [];
                        this.prepareGrid();
                        for (let dict of this.treeComponent.treeModel.roots) {
                            if (dict.data.className === this.selectedDictionary.className) {
                                dict.expand();
                                dict.toggleActivated(null);
                                break;
                            }
                        }
                        this.gridDataDirty = false;
                        this.dialogsService.stopAllSpinnerDialogs();
                    } else {
                        this.dialogsService.stopAllSpinnerDialogs();
                    }
                });
        } else {
            this.isEditMode = !this.isEditMode;
            this.selectedRows = [];
            this.prepareGrid();
            this.dialogsService.stopAllSpinnerDialogs();
        }

        this.changeDetector.detectChanges();
    }

    public onSelectionChanged(event: SelectionChangedEvent): void {
        if(this.isEditMode) {
            this.selectedRows = event.api.getSelectedRows();
        }
    }

    public onCellClicked(event: any): void {
        if(!this.isEditMode) {
            return;
        }
    }

    public onCellDoubleClicked(event: any): void {
        if(!this.isEditMode) {
            let node: ITreeNode;
            node = this.findNodeByIdAndClassName(this.selectedDictionary.className, event.data.datakey);
            if (node) {
                node.setIsActive(true);
                node.scrollIntoView();
            }
        }
    }

    public onCellFocused(event: any): void {
        if(event.rowIndex != null) {
            for (let instance of event.api.getCellRendererInstances({ rowNodes: [this.gridApi.getRowNode(event.rowIndex) ]})) {
                if (instance._componentRef.instance instanceof CellRendererValidation) {
                    instance._componentRef.instance.updateValidation();
                }
            }
        }
    }

    public onCellValueChanged(event: any): void {
        if((event.oldValue !== undefined && event.newValue !== event.oldValue) || (event.oldValue === undefined && event.newValue)) {
            this.changedRowDataMap.set(event.data.datakey, event.data);
            this.gridDataDirty = true;
        }
    }

    public onAddRow(): void {
        if(!this.selectedDictionary) {
            return;
        }

        let newEntry = {
            canDelete: "Y",
            canRead: "Y",
            canWrite: "Y",
            canUpdate: "Y",
            display: "",
            value: "",
            datakey: "add-" + this.addRowIndex,
            action: "add"
        };
        this.addRowIndex++;

        this.selectedDictionary.DictionaryEntry.push(newEntry);
        this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
        this.gridApi.redrawRows();

        this.gridApi.deselectAll();
        let rowIndex  = "" + this.selectedDictionary.DictionaryEntry.indexOf(newEntry);
        this.gridApi.getRowNode(rowIndex).setSelected(true);
        this.gridApi.setFocusedCell(this.gridApi.getRowNode(rowIndex).rowIndex, "name");
        this.gridApi.ensureIndexVisible(this.gridApi.getRowNode(rowIndex).rowIndex, "bottom");
    }

    public onRemoveRows(): void {
     if(this.selectedRows.length > 0) {
         for(let selectedRow of this.selectedRows) {
             this.selectedDictionary.DictionaryEntry.splice(this.selectedDictionary.DictionaryEntry.indexOf(selectedRow), 1)
             if(selectedRow.datakey && selectedRow.datakey.toString().substr(0, 4) !== "add-") {
                 //Remove existing row data
                 selectedRow.action = "delete";
                 this.changedRowDataMap.set(selectedRow.datakey, selectedRow);
                 this.gridDataDirty = true;
             } else if(selectedRow.datakey && selectedRow.datakey.toString().substr(0, 4) === "add-") {
                 //Remove new added row data
                 for(let key of this.changedRowDataMap.keys()) {
                     if (key.toString() === selectedRow.datakey) {
                         this.changedRowDataMap.delete(key);
                         break;
                     }
                 }
             }
         }
         this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);

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
        dictionariesTemp.sort((a: Dictionary, b: Dictionary) => {
            return a.display.toUpperCase().localeCompare(b.display.toUpperCase());
        });
        dictionariesTemp = this.restrictCoreFacilityVisibility(dictionariesTemp);
        this.dictionaries = dictionariesTemp;
    }

    public onClose(): void {
        this.dialogRef.close(this.dataChanged);
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
        this.addRowIndex = 0;
        this.gridDataDirty = false;
        this.selectedRows = [];
        this.isEditMode = false;

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

    private prepareGrid(): void {
        let colDefs: any[] = [];
        for (let field of this.cachedMetaDataFields) {
            if (field.visible === 'Y') {
                let colDef: any = {
                    headerName: field.caption, headerTooltip: field.caption, field: field.dataField,
                    tooltipField: field.dataField, editable: this.isEditMode,
                    isIdentifier: field.isIdentifier, filterParams: {clearButton: true}
                };
                if (field.dataType === "comboBox") {
                    colDef.cellRendererFramework = SelectRenderer;
                    colDef.cellEditorFramework = SelectEditor;
                    colDef.delayValidation = true;
                    colDef.selectOptions = this.dictionaryService.getEntriesExcludeBlank(field.className);
                    colDef.selectOptionsDisplayField = "display";
                    colDef.selectOptionsValueField = "value";
                    colDef.filterValueGetter = this.comboFilterValueGetter;
                } else if(field.dataType === "text") {
                    colDef.cellRendererFramework = TextAlignLeftMiddleRenderer;
                    colDef.cellEditorFramework = TextAlignLeftMiddleEditor;
                    colDef.validators = [Validators.maxLength(Number(field.dataSize))];
                    colDef.errorNameErrorMessageMap = [{ errorName: "maxlength",  errorMessage: "Maximum of " + field.dataSize + " characters" }];
                } else if(field.dataType === "isActive" || field.dataType === "YN") {
                    if (this.dicGridEditable) {
                        colDef.cellRendererFramework = SelectRenderer;
                        colDef.cellEditorFramework = SelectEditor;
                        colDef.selectOptions = this.optionsYN;
                        colDef.selectOptionsDisplayField = "value";
                        colDef.selectOptionsValueField = "value";
                    }
                } else if(field.dataType === "date") {
                    colDef.filter = DateFilter;
                    colDef.filterValueGetter = this.dateFilterValueGetter;
                } else if(field.dataType === "intNumber") {
                    colDef.cellRendererFramework = TextAlignLeftMiddleRenderer;
                    colDef.cellEditorFramework = TextAlignLeftMiddleEditor;
                    colDef.validators = [Validators.pattern(/^\d{0,10}$/)];
                    colDef.errorNameErrorMessageMap = [{ errorName: "pattern",  errorMessage: "Expects an integer number" }];
                    colDef.validateOnlyRenderedCells = true;
                    colDef.filter = NumberFilter;
                    colDef.filterValueGetter = this.numberFilterValueGetter;
                }
                if(field.isNullable && field.isNullable === "N") {
                    if(colDef.validators && colDef.validators.length > 0) {
                        colDef.validators.push(Validators.required);
                        colDef.errorNameErrorMessageMap.push({ errorName: "required",  errorMessage: field.dataField + " is required" });
                    } else {
                        colDef.validators = [Validators.required];
                        colDef.errorNameErrorMessageMap = [{ errorName: "required",  errorMessage: field.dataField + " is required" }];
                    }
                }

                colDefs.push(colDef);
            }
        }

        this.gridApi.setColumnDefs(colDefs);
        this.gridApi.setRowData(this.selectedDictionary.DictionaryEntry);
        this.gridApi.sizeColumnsToFit();
    }

    private dateFilterValueGetter(params: ValueGetterParams): any {
        let dateAsString: string = params.data[params.colDef.field];
        if(dateAsString) {
            let date: Date = new Date(dateAsString);
            return date ? date : "";
        }
        return "";
    }

    private numberFilterValueGetter(params: ValueGetterParams): any {
        let number: number = +(params.data[params.colDef.field]);
        return number;
    }

    private comboFilterValueGetter(params: ValueGetterParams): any {
        let value = params.data[params.colDef.field];
        if(value) {
            let option: DictionaryEntry = ((params.colDef as any).selectOptions as DictionaryEntry[]).find((entry: DictionaryEntry) => (entry.value === value));
            return option ? option.display : "";
        }
        return "";
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
        if (this.selectedEntry.canUpdate === "Y") {
            this.entryForm.enable();
        } else {
            this.entryForm.disable();
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
                value: BrowseDictionaryComponent.getFieldAsString(this.selectedEntry, field.dataField), visible: field.visible,
                dataSize: field.dataSize
            };
            if (field.dataType === "text" && field.length >= 50) {
                entryField.dataType = "textArea";
            }
            if(field.dataType === "intNumber") {
                entryField.dataType = "number";
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
            if (field.visible !== 'Y' || (field.isIdentifier && field.isIdentifier === "Y" && !isInsertMode)) {
                this.entryForm.get(entryField.dataField).disable();
            }

            if(field.visible === "Y") {
                if(field.dataType === "text") {
                    if(field.isNullable && field.isNullable === "N") {
                        this.entryForm.get(entryField.dataField).setValidators([Validators.required, Validators.maxLength(Number(field.dataSize))]);
                    } else {
                        this.entryForm.get(entryField.dataField).setValidators([Validators.maxLength(Number(field.dataSize))]);
                    }
                } else if(field.dataType === "intNumber") {
                    if(field.isNullable && field.isNullable === "N") {
                        this.entryForm.get(entryField.dataField).setValidators([Validators.required, Validators.pattern(/^\d{0,10}$/)]);
                    } else {
                        this.entryForm.get(entryField.dataField).setValidators([Validators.pattern(/^\d{0,10}$/)]);
                    }
                } else {
                    if(field.isNullable && field.isNullable === "N") {
                        this.entryForm.get(entryField.dataField).setValidators([Validators.required]);
                    }
                }
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
                this.dataChanged = true;
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
            });
        } else if(this.selectedDictionary && this.gridDataDirty) {
            this.showSpinner = true;
            let dictionaryEntries: any[] = [];
            for(let value of Array.from(this.changedRowDataMap.values())) {
                if(value.datakey && value.datakey.toString().substr(0, 4) === "add-") {
                    value.datakey = "";
                }
                dictionaryEntries.push(value);
            }
            let savedDictionaryEntries: any[] = [];
            let className: string = this.selectedDictionary.className;
            let entryCount: number = 0;
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
                savedDictionaryEntries.push({
                    action: action,
                    object: entryObject
                });
            }


            if(savedDictionaryEntries.length > 0) {
                this.dictionaryService.saveDictionaries(savedDictionaryEntries, className, () => {
                    entryCount++;
                    if(entryCount === dictionaryEntries.length) {
                        this.changedRowDataMap = new Map<string, any>();
                        this.addRowIndex = 0;
                        this.dataChanged = true;
                        this.isEditMode = false;
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
                    this.showSpinner = false;
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
        this.entryForm.enable();
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
            this.dataChanged = true;
            this.buildTree();
            this.showSpinner = false;
            setTimeout(() => {
                this.selectDictionaryInTree(className);
            });
        }, () => {
            this.showSpinner = false;
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
            this.gridDataDirty = false;
            this.buildTree();
            this.dialogsService.removeSpinnerWorkItem();
            setTimeout(() => {
                if(this.preSelectedDictionary.length > 0) {
                    let className: string = this.preSelectedDictionary[0];
                    for(let dict of this.treeComponent.treeModel.roots) {
                        if(dict.data.className === className) {
                            dict.expand();
                            if (this.preSelectedEntry) {
                                for (let entry of dict.children) {
                                    if(entry.data.datakey === this.preSelectedEntry) {
                                        entry.toggleActivated(null);
                                        break;
                                    }
                                }
                            } else {
                                dict.toggleActivated(null);
                            }
                            break;
                        }
                    }
                }
            });
        }, () => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    private static getFieldAsString(obj: any, field: string): string {
        return (obj && obj[field]) ? obj[field] : "";
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
