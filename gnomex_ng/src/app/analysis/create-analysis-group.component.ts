/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {
    AfterViewInit, Component, Inject, OnInit
} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {AnalysisService} from "../services/analysis.service";
import {FormControl, Validators} from '@angular/forms';
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'create-analysis-group-dialog',
    templateUrl: 'create-analysis-group-dialog.html',
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }
        div.inlineDiv {
            display: inline-block;
            margin: 0.3rem 0.8rem 0.3rem 0.8rem;
        }
        .full-width {
            width: 100%;
        }

    `]
})

export class CreateAnalysisGroupComponent implements OnInit, AfterViewInit {
    private labList: any[];
    private _nodesString: string = "";
    private hasAnalysisGroup: boolean = false;
    private i: number = 0;
    private idLabString: string;
    private analysisName: string;
    private analysisGroupName: string;
    private analysisGroupDescription: string;
    public showSpinner: boolean = false;

    analysisGroupFormControl = new FormControl('', [
        Validators.required
        ]);

    constructor(private dialogRef: MatDialogRef<CreateAnalysisGroupComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogService:DialogsService,
                private analysisService: AnalysisService, public prefService: UserPreferencesService) {

        this.labList = data.labList
    }

    ngOnInit() {
    }

    ngAfterViewInit() {

    }

    onLabSelect(event: any) {
        if (event.args.item) {
            this.idLabString = event.args.item.value;
        }
    }

    onLabUnselect(event: any) {
    }

    /**
     * Save a new analysis group.
     */
    createAnalysisGroupSaveButtonClicked() {
        this.showSpinner = true;
        let idAnalysisGroup: any = 0;
        let params: HttpParams  = new HttpParams()
            .set("idLab", this.idLabString)
            .set("idAnalysisGroup", idAnalysisGroup)
            .set("name", this.analysisGroupName)
            .set("description", this.analysisGroupDescription);

        this.analysisService.saveAnalysisGroup(params).subscribe(response => {
            this.analysisService.refreshAnalysisGroupList_fromBackend();
        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
            this.dialogService.alert(err.gError.message);
        });
    }
}

