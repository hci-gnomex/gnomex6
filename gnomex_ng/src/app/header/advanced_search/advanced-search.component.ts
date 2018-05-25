import {
    Component,
    ElementRef,
    HostListener,
    Inject,
    OnInit,
    OnDestroy,
    ViewChild
} from "@angular/core";

import {MatDialogRef, MatDialog, MAT_DIALOG_DATA, DialogPosition} from "@angular/material";
import { TextAlignLeftMiddleRenderer } from "../../util/grid-renderers/text-align-left-middle.renderer";
import {AdvancedSearchService} from "./advanced-search.service";
import {Subscription} from "rxjs/Subscription";
import {DialogsService} from "../../util/popup/dialogs.service";
import {SpinnerDialogComponent} from "../../util/popup/spinner-dialog.component";
import {TextSelectXorMultiselectEditor} from "../../util/grid-editors/text-select-xor-multiselect.editor";

@Component({
    selector: 'advanced-search-component',
    templateUrl: 'advanced-search.component.html',
    styles: [`
        
        .inline-block { display: inline-block; }
        
        .full-height { height: 100%; }
        .full-width  { width:  100%; }
        
        .padding { padding: 0.6em; }
        
        .no-margin  { margin:  0; }
        .no-padding { padding: 0; }
        
        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }
        
        .flex-container { 
            display: flex;
            flex-direction: column; 
        }
        .flex-fill {
            flex: 1;
        }
        
        .header { 
            background-color: #84b278; 
            color: white; 
            display: inline-block;
        }
        .body { 
            overflow: auto; 
            font-size: small; 
        }
        
        .body-size { 
            min-height: 25em;
            margin: 0.4em 0.4em 0 0.4em;
        }
        
        .label {
            padding: 0 3em 0 0.5em;
            vertical-align: top;
            color: darkblue;
        }
        .mat-input-label {
            padding: 0 0.5em;
            vertical-align: center;
            color: darkblue;
        }
        
        .margin    { margin: 0.4em; }
        
        .background       { background-color: #eeeeeb; }
        .light-background { background-color: #ffffff; }
        
        .right-aligned { text-align: right; }
        
        .button-container { 
            text-align:left; 
            padding:0.4em; 
        }
        
        .horizontal-rule {
            height: 2px;
            width: calc(100% - 0.8em);
            background-color: #ebeae8;
            margin: 0.4em;
        }

        .button-bar {
            display: table-cell;
            vertical-align: middle;
        }
        .vertical-spacer {
            display: inline-block;
            vertical-align: middle;
            width: 1px;
            height: 2em;
            background-color: #ebeae8;
            margin: 0.1em;
        }

        .radio-button {
            margin: 0 2em 0 0;
            padding: 0;
        }
        
        .grid-container {
            width:  100%; 
            padding-bottom: 0.5em;
        }
        
        .medium-input {
            width: 20em;
        }
        
        .fixed-height {
            min-height: 35em;
            max-height: 35em;
            height: 35em;
        }
        
        .grabbable {
            cursor: move;
            cursor: -webkit-grab;
        }
        .grabbed {
            cursor: move;
            cursor: -webkit-grabbing;
        }
        
        .small-as-possible {
            min-width:  0;
            min-height: 0;
        }
        
        .vertical-align-center { vertical-align: middle; }
        
        .font-large { font-size: large; }
    `]
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {

    readonly ALL_OBJECTS : string = 'ALL_OBJECTS';
    readonly EXPERIMENTS : string = 'EXPERIMENTS';
    readonly ANALYSES    : string = 'ANALYSES';
    readonly PROTOCOLS   : string = 'PROTOCOLS';
    readonly DATA_TRACKS : string = 'DATA_TRACKS';
    readonly TOPICS      : string = 'TOPICS';

    readonly MATCH_ALL_TERMS : string = 'MATCH_ALL_TERMS';
    readonly MATCH_ANY_TERM  : string = 'MATCH_ANY_TERM';

    movingDialog: boolean = false;

    searchText: string = '';
    searchType: string = this.ALL_OBJECTS;
    matchType:  string = this.MATCH_ALL_TERMS;

    context: any = this;

    newSearchGridApi: any;
    newSearchGridColumnApi: any;

    searchResultsGridApi: any;
    searchResultsGridColumnApi: any;

    originalXClick: number = 0;
    originalYClick: number = 0;

    @ViewChild('topmostLeftmost') topmostLeftmost: ElementRef;

    protected positionX: number = 0;
    protected positionY: number = 0;

    private allObjectSearchList: any[];
    private experimentSearchList: any[];
    private analysisSearchList: any[];
    private protocolSearchList: any[];
    private dataTrackSearchList: any[];
    private topicSearchList: any[];

    private dictionaryMap: any[];

    private allObjectSearchListSubscription:  Subscription;
    private experimentSearchListSubscription: Subscription;
    private analysisSearchListSubscription:   Subscription;
    private protocolSearchListSubscription:   Subscription;
    private dataTrackSearchListSubscription:  Subscription;
    private topicSearchListSubscription:      Subscription;

    private dictionaryMapSubscription: Subscription;

    private spinnerRef: MatDialogRef<SpinnerDialogComponent>;

    constructor(private dialog: MatDialog,
                private dialogRef: MatDialogRef<AdvancedSearchComponent>,
                private dialogService: DialogsService,
                private advancedSearchService: AdvancedSearchService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (data) {
            this.searchText = !!data.searchText ? data.searchText : '';
        }

        this.spinnerRef = this.dialogService.startDefaultSpinnerDialog();

        this.allObjectSearchListSubscription = this.advancedSearchService.getAllObjectSearchListObservable().subscribe((list) => {
            this.allObjectSearchList = list;
            this.onSearchTypeChanged();
        });
        this.experimentSearchListSubscription = this.advancedSearchService.getExperimentSearchListObservable().subscribe((list) => {
            this.experimentSearchList = list;
            this.onSearchTypeChanged();
        });
        this.analysisSearchListSubscription = this.advancedSearchService.getAnalysisSearchListObservable().subscribe((list) => {
            this.analysisSearchList = list;
            this.onSearchTypeChanged();
        });
        this.protocolSearchListSubscription = this.advancedSearchService.getProtocolSearchListObservable().subscribe((list) => {
            this.protocolSearchList = list;
            this.onSearchTypeChanged();
        });
        this.dataTrackSearchListSubscription = this.advancedSearchService.getDataTrackSearchListObservable().subscribe((list) => {
            this.dataTrackSearchList = list;
            this.onSearchTypeChanged();
        });
        this.topicSearchListSubscription = this.advancedSearchService.getTopicSearchListObservable().subscribe((list) => {
            this.topicSearchList = list;
            this.onSearchTypeChanged();
        });

        this.dictionaryMapSubscription = this.advancedSearchService.getDictionaryMapObservable().subscribe((list) => {
            this.dictionaryMap = list;
            this.onSearchTypeChanged();
        });
    }

    ngOnInit() { }
    ngOnDestroy() { }

    assignNewSearchGridContents(): void {
        if (this.newSearchGridApi) {
            this.newSearchGridApi.setRowData([]);
            this.newSearchGridApi.setColumnDefs(this.getNewSearchColumnDefinitions());
            this.newSearchGridApi.sizeColumnsToFit();
        }
    }

    private getNewSearchColumnDefinitions(): any[] {
        return [
            {
                headerName: "Specific Field",
                editable: false,
                width: 100,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "displayName"
            },
            {
                headerName: "Value (Partial or Whole) to Search for",
                editable: true,
                width: 300,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextSelectXorMultiselectEditor,
                field: "value"
            }
        ];
    }

    assignSearchResultsGridContents(): void {
        if (this.searchResultsGridApi) {
            this.searchResultsGridApi.setRowData([]);
            this.searchResultsGridApi.setColumnDefs(this.getSearchResultsColumnDefinitions());
            this.searchResultsGridApi.sizeColumnsToFit();
        }
    }

    private getSearchResultsColumnDefinitions(): any[] {
        return [];
    }

    onNewSearchGridReady(event: any): void {
        this.newSearchGridApi = event.api;
        this.newSearchGridColumnApi = event.columnApi;

        this.assignNewSearchGridContents();
        this.onNewSearchGridSizeChanged();
    }
    onSearchResultsGridReady(event: any): void {
        this.searchResultsGridApi = event.api;
        this.searchResultsGridColumnApi = event.columnApi;

        this.assignSearchResultsGridContents();
        this.onSearchResultsGridSizeChanged();
    }

    onNewSearchGridSizeChanged(): void {
        if (this.newSearchGridApi) {
            this.newSearchGridApi.sizeColumnsToFit();
        }
    }
    onSearchResultsGridSizeChanged(): void {
        if (this.searchResultsGridApi) {
            this.searchResultsGridApi.sizeColumnsToFit();
        }
    }

    onMouseDownHeader(event: any): void {
        if (!event) {
            return;
        }

        this.positionX = this.topmostLeftmost.nativeElement.offsetLeft;
        this.positionY = this.topmostLeftmost.nativeElement.offsetTop;

        this.originalXClick = event.screenX;
        this.originalYClick = event.screenY;

         this.movingDialog = true;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: any): void {
        if (!event) {
            return;
        }

        if (this.movingDialog) {
            this.positionX += event.screenX - this.originalXClick;
            this.positionY += event.screenY - this.originalYClick;

            this.originalXClick = event.screenX;
            this.originalYClick = event.screenY;

            let newDialogPosition: DialogPosition = {
                left:   '' + this.positionX + 'px',
                top:    '' + this.positionY + 'px',
            };

            this.dialogRef.updatePosition(newDialogPosition);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: any): void {
        this.movingDialog = false;
    }

    onClickClearButton(): void {
        console.log("This should clear the search terms from the window, shown and unshown.");
    }

    onClickCancelButton(): void {
        this.dialogRef.close();
    }

    onSearchTypeChanged() {
        if (!this.newSearchGridApi || !this.dictionaryMap) {
            return;
        }

        let rowData: any[] = [];

        switch (this.searchType) {
            case this.ALL_OBJECTS : rowData = this.allObjectSearchList;  break;
            case this.EXPERIMENTS : rowData = this.experimentSearchList; break;
            case this.ANALYSES    : rowData = this.analysisSearchList;   break;
            case this.PROTOCOLS   : rowData = this.protocolSearchList;   break;
            case this.DATA_TRACKS : rowData = this.dataTrackSearchList;  break;
            case this.TOPICS      : rowData = this.topicSearchList;      break;
            default : // Do nothing;
        }

        if (!rowData) {
            rowData = [];
        } else {
            // Due to XML parsing of single elements.
            if (Array.isArray(rowData) && rowData.length == 1 && !!rowData[0].Field) {
                rowData[0] = rowData[0].Field;
            }

            if (!Array.isArray(rowData)) {
                rowData = [rowData];
            }
        }

        if (rowData && Array.isArray(rowData) && this.dictionaryMap && Array.isArray(this.dictionaryMap)) {
            for (let row of rowData) {

                if (row.isOptionChoice && row.isOptionChoice.toLowerCase() === 'y') {
                    for (let dictionary of this.dictionaryMap) {
                        if (dictionary.fieldName === row.displayName) {
                            row.dictionary = dictionary;
                        }
                    }
                }
            }
        }

        this.newSearchGridApi.setRowData(rowData);

        if (!!this.spinnerRef) {
            this.spinnerRef.close();
        }
    }
}