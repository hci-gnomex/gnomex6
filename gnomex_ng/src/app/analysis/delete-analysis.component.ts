/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Component, Inject} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {AnalysisService} from "../services/analysis.service";

@Component({
    selector: 'delete-analysis-dialog',
    templateUrl: 'delete-analysis-dialog.html'
})

export class DeleteAnalysisComponent {
    private _selectedItem: any;
    private _label: string;
    private _idAnalysisGroup: string;
    public _nodes: any[];
    public _nodesString: string = "";
    hasAnalysisGroup: boolean = false;
    public i:number = 0;

    constructor(private dialogRef: MatDialogRef<DeleteAnalysisComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private analysisService: AnalysisService
    ) {
        this._idAnalysisGroup = data.idAnalysisGroup;
        this._label = data.label;
        this._selectedItem = data.selectedItem;
        this._nodes = data.nodes;
        for (let n of this._nodes) {
            this._nodesString = this._nodesString.concat(n.data.name);
            this._nodesString = this._nodesString.concat(",");
            if (n.level === 2) {
                this.hasAnalysisGroup = true;
            }
        }
        this._nodesString = this._nodesString.substring(0, this._nodesString.lastIndexOf(","));
    }
    /**
     * The yes button was selected in the delete dialog.
     */
    deleteAnalysisYesButtonClicked() {
        this.deleteAnalysis();
    }

    /**
     * Delete the analysis.
     */
    deleteAnalysis () {
        if (this.i < this._nodes.length) {

            var params: URLSearchParams = new URLSearchParams();
            if (this._nodes[this.i].level === 3) {
                params.set("idAnalysis", this._nodes[this.i].data.idAnalysis);
                var lPromise = this.analysisService.deleteAnalysis(params).toPromise();
                lPromise.then(response => {
                    console.log("Analysis successful delete");
                    this.deleteAnalysis();
                    if (this.i === this._nodes.length)
                        this.analysisService.refreshAnalysisGroupList_fromBackend();
                });

            }
            else if (this._nodes[this.i].level === 2) {
                params.set("idAnalysisGroup", this._nodes[this.i].data.idAnalysisGroup);
                var lPromise = this.analysisService.deleteAnalysisGroup(params).toPromise();
                lPromise.then(response => {
                    console.log("Analysis Group successful delete");
                    this.deleteAnalysis();
                    if (this.i === this._nodes.length)
                        this.analysisService.refreshAnalysisGroupList_fromBackend();
                });

            }
            this.i++;
        }
        this.dialogRef.close();
    }
}
