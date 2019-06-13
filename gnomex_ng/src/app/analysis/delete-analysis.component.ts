import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {Component, Inject} from "@angular/core";
import {AnalysisService} from "../services/analysis.service";
import * as _ from "lodash";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: "delete-analysis-dialog",
    templateUrl: "delete-analysis-dialog.html"
})

export class DeleteAnalysisComponent extends BaseGenericContainerDialog {

    public _nodesString: string = "";
    public hasAnalysisGroup: boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;

    private _selectedItem: any;
    private _label: string;
    private _idAnalysisGroup: string;
    private _nodes: any[] = [];
    private _sortedNodes: any[] = [];
    private i: number = 0;


    constructor(private dialogRef: MatDialogRef<DeleteAnalysisComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private analysisService: AnalysisService,
                private dialogService: DialogsService) {

        super();
        this._idAnalysisGroup = data.idAnalysisGroup;
        this._label = data.label;
        this._selectedItem = data.selectedItem;

        for (let n of this.data.nodes) {
            if(n.data) {
                this._nodesString = this._nodesString.concat(n.data.name);
            } else {
                this._nodesString = this._nodesString.concat(n.name);
            }
            this._nodesString = this._nodesString.concat(", ");
            this._nodes.push(n);
            if (n.level === 2 && n.hasChildren) {
                this.hasAnalysisGroup = true;
                for (let analysis of n.children) {
                    this._nodes.push(analysis);
                }
            }
        }

        data.nodes = data.nodes.concat(this._nodes);
        data.nodes = _.uniqBy(data.nodes, "id");
        this._sortedNodes = data.nodes.sort((n1, n2) => n1.level < n2.level);
        this._nodesString = this._nodesString.substring(0, this._nodesString.lastIndexOf(","));

        this.primaryDisable = (action) => {
            return false;
        };

    }

    /**
     * Delete the analysis.
     */
    deleteAnalysis () {
        this.dialogService.startDefaultSpinnerDialog();
        if (this.i < this._sortedNodes.length) {
            let params: HttpParams = new HttpParams();

            if(!this._sortedNodes[this.i].data) { // delete analysis from grid case
                params = params.set("idAnalysis", this._nodes[this.i].idAnalysis);
                this.analysisService.deleteAnalysis(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });
                this.analysisService.isDeleteFromGrid = true; // Flag used to refresh AnalysisOverviewList
            } else if (this._sortedNodes[this.i].level === 3) {
                params = params.set("idAnalysis", this._sortedNodes[this.i].data.idAnalysis);
                this.analysisService.deleteAnalysis(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });

            } else if (this._sortedNodes[this.i].level === 2 || !this._nodes[this.i].data) {
                params = params.set("idAnalysisGroup", this._sortedNodes[this.i].data.idAnalysisGroup);
                this.analysisService.deleteAnalysisGroup(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });

            }
            this.i++;
        } else {
            setTimeout(() => {
                if(this.analysisService.isDeleteFromGrid) {// refresh AnalysisOverviewList
                    this.analysisService.analysisPanelParams["refreshParams"] = true;
                }

                this.analysisService.refreshAnalysisGroupList_fromBackend();
                this.dialogRef.close(true);
                this.dialogService.stopAllSpinnerDialogs();
            });

        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
