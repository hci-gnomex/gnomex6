/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {AnalysisService} from "../services/analysis.service";
import * as _ from "lodash";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'delete-analysis-dialog',
    templateUrl: 'delete-analysis-dialog.html'
})

export class DeleteAnalysisComponent {
    private _selectedItem: any;
    private _label: string;
    private _idAnalysisGroup: string;
    private _nodes: any[] = [];
    private _sortedNodes: any[] = [];
    private _nodesString: string = "";
    hasAnalysisGroup: boolean = false;
    public i:number = 0;
    public showSpinner: boolean = false;

    constructor(private dialogRef: MatDialogRef<DeleteAnalysisComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private analysisService: AnalysisService,
                private dialogService: DialogsService,
    ) {
        this._idAnalysisGroup = data.idAnalysisGroup;
        this._label = data.label;
        this._selectedItem = data.selectedItem;

        for (let n of this.data.nodes) {
            if(n.data){
                this._nodesString = this._nodesString.concat(n.data.name);
            }else{
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
        data.nodes = _.uniqBy(data.nodes, 'id');
        this._sortedNodes = data.nodes.sort((n1, n2)=>n1.level < n2.level);
        this._nodesString = this._nodesString.substring(0, this._nodesString.lastIndexOf(","));
    }
    /**
     * The yes button was selected in the delete dialog.
     */
    deleteAnalysisYesButtonClicked() {
        this.showSpinner = true;
        this.deleteAnalysis();
    }

    /**
     * Delete the analysis.
     */
    deleteAnalysis () {
        if (this.i < this._sortedNodes.length) {
            let params: HttpParams = new HttpParams();

            if(!this._sortedNodes[this.i].data){ // delete analysis from grid case
                params = params.set("idAnalysis", this._nodes[this.i].idAnalysis);
                this.analysisService.deleteAnalysis(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                },(err:IGnomexErrorResponse) => {
                    this.dialogService.alert( err.gError.message);
                });
            }
            else if (this._sortedNodes[this.i].level === 3) {
                params = params.set("idAnalysis", this._sortedNodes[this.i].data.idAnalysis);
                this.analysisService.deleteAnalysis(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                },(err:IGnomexErrorResponse) => {
                    this.dialogService.alert( err.gError.message);
                });

            }
            else if (this._sortedNodes[this.i].level === 2 || !this._nodes[this.i].data) {
                params = params.set("idAnalysisGroup", this._sortedNodes[this.i].data.idAnalysisGroup);
                this.analysisService.deleteAnalysisGroup(params).pipe(first()).subscribe(response => {
                    this.deleteAnalysis();
                },(err:IGnomexErrorResponse) => {
                    this.dialogService.alert( err.gError.message);
                });

            }
            this.i++;
        }
        else {
            setTimeout(() => {
                this.analysisService.refreshAnalysisGroupList_fromBackend();
            })

        }
    }
}
