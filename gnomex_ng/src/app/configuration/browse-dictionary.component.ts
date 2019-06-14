import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";

import {ITreeOptions, TreeComponent, TreeNode} from "angular-tree-component";
import {Dictionary} from "./dictionary.interface";
import {DictionaryEntry} from "./dictionary-entry.type";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridApi, GridReadyEvent} from "ag-grid-community";
import {FormControl, FormGroup} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {ValueFormatterParams} from "ag-grid-community/dist/lib/entities/colDef";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: "browse-dictionary",
    template: `
        <div class="flex-container-row double-padded-left-right full-height full-width">
            <div class="full-height panel">
                <div class="flex-container-row justify-space-between align-center tree-row">
                    <label>Dictionaries</label>
                    <div>
                        <button mat-button (click)="refreshAll()"><img src="../../assets/refresh.png" class="button-image"></button>
                        <button mat-button [disabled]="!this.selectedDictionary && !this.selectedEntry" (click)="addEntry()">
                            <img [src]="!this.selectedDictionary && !this.selectedEntry ? '../../assets/add_disable.png' : '../../assets/add.png'" class="button-image">
                        </button>
                        <button mat-button [disabled]="!this.selectedEntry" (click)="deleteEntry()">
                            <img [src]="!this.selectedEntry ? '../../assets/delete_disable.png' : '../../assets/delete.png'" class="button-image">
                        </button>
                    </div>
                </div>
                <div class="flex-container-row align-center tree-row">
                    <mat-form-field class="flex-one">
                        <input matInput placeholder="Search" [(ngModel)]="this.searchText" (keydown.enter)="searchDictionary()">
                    </mat-form-field>
                    <div>
                        <button mat-button (click)="searchDictionary()"><img src="../../assets/magnifier.png" class="button-image"></button>
                        <button mat-button (click)="clearSearch()"><img src="../../assets/cross.png" class="button-image"></button>
                    </div>
                </div>
                <div class="tree-container">
                    <tree-root #treeComponent
                               (activate)="this.selectTreeItem($event)"
                               [nodes]="this.dictionaries"
                               [options]="this.treeOptions">
                        <ng-template #treeNodeTemplate let-node>
                            <img src="{{node.data.icon}}" class="button-image icon">
                            <span>{{node.data.display}}</span>
                        </ng-template>
                    </tree-root>
                </div>
            </div>
            <div class="full-height flex-container-col detail-view extra-padded">
                <div [hidden]="!this.dictionaryName">
                    <label>{{this.dictionaryName}}</label>
                </div>
                <div [hidden]="!this.selectedDictionary" class="flex-one">
                    <ag-grid-angular class="ag-theme-balham full-height full-width"
                                     (gridReady)="this.onGridReady($event)"
                                     [enableSorting]="true"
                                     [enableColResize]="true">
                    </ag-grid-angular>
                </div>
                <form [hidden]="!this.selectedEntry" class="flex-one overflow-auto" [formGroup]="this.entryForm">
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
                            <mat-form-field *ngSwitchCase="'isActive'" class="full-width">
                                <mat-select [placeholder]="field.caption" [formControlName]="field.dataField">
                                    <mat-option value="Y">Yes</mat-option>
                                    <mat-option value="N">No</mat-option>
                                </mat-select>
                            </mat-form-field>
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

    public entryForm: FormGroup;
    public entryFields: any[] = [];
    public visibleEntryFields: any[] = [];
    public showSpinner: boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;
    private isDialog: boolean = false;
    private preSelectedDictionary: string;
    private preSelectedEntry: string;

    private cachedMetaDataClassName: string = "";
    private cachedMetaDataFields: any[] = [];

    private gridApi: GridApi;

    constructor(private dialogRef: MatDialogRef<BrowseDictionaryComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dictionaryService: DictionaryService,
                private changeDetector: ChangeDetectorRef,
                private securityAdvisor: CreateSecurityAdvisorService,
                private utilService: UtilService,
                private dialogsService: DialogsService) {
        super();
        if(this.data && Object.keys(this.data).length > 0) {
            this.isDialog = this.data.isDialog;
            this.preSelectedDictionary = this.data.preSelectedDictionary;
            this.preSelectedEntry = this.data.preSelectedEntry;
        }
    }


    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.entryForm = new FormGroup({});
        this.buildTree();
        this.entryForm.markAsPristine();
        this.primaryDisable = (action) => {
            return this.entryForm.invalid || !this.selectedEntry || !this.entryForm.dirty;
        };

        if(this.isDialog) {
            setTimeout(() => {
                let node: ITreeNode;
                node = this.findNodeByIdAndClassName(this.preSelectedDictionary, this.preSelectedEntry);
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

    private buildTree(): void {
        let dictionariesTemp: Dictionary[] = this.dictionaryService.getEditableDictionaries();
        for (let dictionary of dictionariesTemp) {
            dictionary.display = dictionary.displayName;
            dictionary.icon = "assets/folder.png";
            dictionary.DictionaryEntry = this.dictionaryService.getEntriesExcludeBlank(dictionary.className);
            for (let entry of (dictionary.DictionaryEntry as DictionaryEntry[])) {
                entry.icon = "assets/page_white.png";
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
        },(err:IGnomexErrorResponse) =>{
        });
    }

    private prepareGrid(): void {
        let colDefs: any[] = [];
        for (let field of this.cachedMetaDataFields) {
            if (field.visible === 'Y') {
                let colDef: any = {
                    headerName: field.caption, headerTooltip: field.caption, field: field.dataField, tooltipField: field.dataField
                };
                if (field.dataType === "comboBox") {
                    colDef.valueFormatter = this.optionsFieldValueFormatter;
                    colDef.comboBoxOptions = this.dictionaryService.getEntriesExcludeBlank(field.className);
                }
                colDefs.push(colDef);
            }
        }
        this.gridApi.setColumnDefs(colDefs);
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
                if(this.isDialog) {
                    this.showSpinner = false;
                    this.dialogRef.close();
                } else {
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
                }
            }, () => {
                this.showSpinner = false;
                this.dialogsService.confirm("An error occurred while saving dictionary", null);
            });
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
            this.dialogsService.confirm("An error occurred while deleting dictionary", null);
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
        this.dictionaryService.reloadAndRefresh(() => {
            this.buildTree();
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
