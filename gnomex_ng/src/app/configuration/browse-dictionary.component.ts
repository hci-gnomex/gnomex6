import {Component, OnInit, ViewChild} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";

import {TreeComponent, ITreeOptions, TreeModel} from "angular-tree-component";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
//
@Component({
    selector: "browse-dictionary-component-launcher",
    template: `<div></div>`,
    styles: [``]
})

export class BrowseDictionaryComponentLauncher {

    constructor(private dialog: MatDialog, private router: Router) {
        let dialogRef = this.dialog.open(BrowseDictionaryComponent, { width: '60em', panelClass: 'no-padding-dialog' });

        dialogRef.afterClosed().subscribe((result) => {
            // After closing the dialog, route away from this component so that the dialog could
            // potentially be reopened.
            this.router.navigate([{ outlets: {modal: null}}]);
        });
    }
}


@Component({
    selector: "browse-dictionary",
    template: `
        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; flex-basis: 350px">
            <div class="flex-column-container">
                <div>
                    Dictionaries
                    <button (click)="addEntry()">
                        <img src="../../assets/add.png" height="16" width="16">
                    </button>
                    <button (click)="deleteEntry()">
                        <img src="../../assets/delete.png" height="16" width="16">
                    </button>
                </div>
                <div>
                    Search Dictionaries:
                </div>
                <div>
                    <input type="text" name="searchText" [(ngModel)]="searchText" size="40" (keypress)="searchKeypress($event)">
                    <button (click)="searchDictionary()">
                        <img src="../../assets/magnifier.png" height="16" width="16">
                    </button>
                    <button (click)="clearSearch()">
                        <img src="../../assets/cross.png" height="16" width="16">
                    </button>
                </div>
                <tree-root #treeComponent
                           (activate)="selectTreeItem($event)"
                           [nodes]="items"
                           [options]="options">
                    <ng-template #treeNodeTemplate let-node>
                        <img src="{{node.data.icon}}" height="16" width="16">
                        <span>{{node.data.display}}</span>
                    </ng-template>
                </tree-root>
            </div>
            <div class="flex-column-container">
                <div>
                    {{selectedDictionaryText}}
                </div>
                <div *ngIf="selectedDictionary">
                    * GRID *
                </div>
                <div *ngIf="selectedEntry">
                    <div *ngFor="let editField of editFields">
                        <div *ngIf="editField.dataType == 'text'">
                            {{editField.caption}}<br />
                            <input type="text" name="{{editField.dataField}}" value="{{editField.value}}" size="60">
                        </div>
                        <div *ngIf="editField.dataType == 'textArea'">
                            {{editField.caption}}<br />
                            <textarea name="{{editField.dataField}}" rows="3" cols="80">{{editField.value}}</textarea>
                        </div>
                        <div *ngIf="editField.dataType == 'comboBox'">
                            {{editField.caption}}<br />
                            <mat-form-field>
                                <mat-select [(value)]="editField.value">
                                    <mat-option *ngFor="let option of editField.options" [value]="option.value">
                                        {{option.display}}
                                    </mat-option>
                                </mat-select>
                            </mat-form-field>
                        </div>
                        <div *ngIf="editField.dataType == 'isActive'">
                            {{editField.caption}}<br />
                            <mat-form-field>
                                <mat-select [(value)]="editField.value">
                                    <mat-option></mat-option>
                                    <mat-option value="Y">Yes</mat-option>
                                    <mat-option value="N">No</mat-option>
                                </mat-select>
                            </mat-form-field>
                        </div>
                        <div *ngIf="editField.dataType == 'YN'">
                            {{editField.caption}}<br />
                            <div *ngIf="editField.value == 'Y'; else ynFalse">
                                <input type="checkbox" name="{{editField.dataField}}" checked>
                            </div>
                            <ng-template #ynFalse>
                                <input type="checkbox" name="{{editField.dataField}}">
                            </ng-template>
                        </div>
                        <div *ngIf="editField.dataType == 'date'">
                            {{editField.caption}}<br />
                            <input type="text" name="{{editField.dataField}}" value="{{editField.value}}" size="60">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `,
})

export class BrowseDictionaryComponent implements OnInit{

    @ViewChild("treeComponent") treeComponent: TreeComponent;

    editFields: any[];
    selectedDictionary: any;
    selectedEntry: any;
    selectedDictionaryText: string = "";
    selectedValue: string[] = [];
    searchText: string = "";

    options: ITreeOptions = {
        displayField: "display",
        childrenField: "items",
        useVirtualScroll: true,
        nodeHeight: 22,
    };

    items: any;

    constructor(private dictionaryService:DictionaryService) {
        this.items = [];
    }

    ngOnInit() {
        this.buildTree();
    }

    addEntry(): void {
        alert("no");
    }

    deleteEntry(): void {
        alert("no");
    }

    searchDictionary(): void {
        this.treeComponent.treeModel.filterNodes((node) => {
            if (node.data.display.toUpperCase().includes(this.searchText.toUpperCase())) {
                return true;
            }
            if (node.data.dictionaryDisplay.toUpperCase().includes(this.searchText.toUpperCase())) {
                return true;
            }
            if (node.data.hasOwnProperty("propertyDescription") && node.data.propertyDescription.toUpperCase().includes(this.searchText.toUpperCase())) {
                return true;
            }
            return false;
        },false);
    }

    clearSearch(): void {
        this.searchText = "";
        this.searchDictionary();
    }

    searchKeypress(event): void {
        if (event.keyCode == 13) {   // ENTER
            this.searchDictionary();
        }
    }

    buildTree(): void {
        let dictionaries: any[] = this.dictionaryService.getEditableDictionaries();
        for (let dictionary of dictionaries) {
            dictionary.id = dictionary.className;
            dictionary.parentid = -1;
            dictionary.display = dictionary.displayName;
            dictionary.dictionaryDisplay = dictionary.displayName;
            dictionary.icon = "assets/folder.png";
            dictionary.items = this.dictionaryService.getEntriesExcludeBlank(dictionary.className);
            for (let entry of dictionary.items) {
                entry.parentid = dictionary.id;
                entry.className = dictionary.className;
                entry.dictionaryDisplay = dictionary.displayName;
                entry.icon = "assets/page_white.png";
            }
        }
        this.items = dictionaries;
    }

    selectTreeItem(event: any): void {
        this.selectedDictionary = null;
        this.selectedEntry = null;
        this.selectedDictionaryText = "";
        this.editFields = null;
        let selectedObject = JSON.parse(JSON.stringify(event.node.data));
        if (event.node.level === 1) {
            this.selectedDictionary = selectedObject;
            this.selectedDictionaryText = selectedObject.display;
            this.selectDictionary();
        }
        if (event.node.level === 2) {
            this.selectedEntry = selectedObject;
            this.selectedDictionaryText = selectedObject.dictionaryDisplay;
            this.selectEntry();
        }
    }

    private selectDictionary() {
    }

    private selectEntry() {
        this.dictionaryService.getMetaData(this.selectedEntry.className).subscribe((response) => {
            let newFields: any[] = [];
            for (let field of response.Dictionary.Field) {
                if (field.visible == 'Y') {
                    let newField: any = {};
                    newField.dataField = field.dataField;
                    newField.dataType = field.dataType;
                    newField.caption = field.caption;
                    newField.value = this.fieldAsString(this.selectedEntry, field.dataField);
                    this.selectedValue[newField.dataField] = newField.value;
                    if (field.dataType == "text" && field.length >= 50) {
                        newField.dataType = "textArea";
                    }
                    if (field.dataType == "comboBox") {
                        newField.options = this.dictionaryService.getEntries(field.className);
                    }
                    newFields.push(newField);
                }
            }
            this.editFields = newFields;
        });
    }

    private fieldAsString(obj, field): string {
        if (obj && obj[field]) {
            return obj[field];
        }
        return "";
    }

}
