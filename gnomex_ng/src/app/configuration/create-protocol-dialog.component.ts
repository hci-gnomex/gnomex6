import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DictionaryService} from "../services/dictionary.service";
import {ProtocolService} from "../services/protocol.service";

@Component({
    selector: 'create-protocol-dialog',
    templateUrl: 'create-protocol-dialog.component.html',
    styles: [`

        .no-margin  { margin:  0; }
        .no-padding { padding: 0; }
        
        .padded { padding: 0.6em; }

        .right-align {
            text-align: right;
        }
        
        .header {
            background-color: #84b278;
            color: white;
            display: inline-block;
        }
        
        .background {
            background-color: #eeeeeb;
        }
        
        .title {
            font-size: large;
        }
    `]
})
export class CreateProtocolDialogComponent implements OnInit {

    protected protocolType: string = '';
    protected protocolName: string = '';

    protected protocolClassName: string = '';
    protected selectedIdAnalysisType: string = '';

    protected selectedExperimentPlatformCodeRequestCategory: string = '';

    protected experimentPlatformList: any[] = [];

    protected analysisTypeList: any[];

    constructor(private dialogRef: MatDialogRef<CreateProtocolDialogComponent>,
                private dictionaryService: DictionaryService,
                private protocolService: ProtocolService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (data
            && data.protocolType && data.protocolType !== ''
            && data.protocolClassName && data.protocolClassName !== '') {
            this.protocolType = data.protocolType;
            this.protocolClassName = data.protocolClassName;
        } else {
            dialogRef.close();
        }

        this.analysisTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
    }

    ngOnInit(): void {
        let tempExperimentPlatformList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.experimentPlatformList = tempExperimentPlatformList.filter((experimentPlatform) => {
            if (experimentPlatform && experimentPlatform.isActive && experimentPlatform.isActive === 'Y') {
                return true;
            }

            return false;
        });

        this.protocolService.getSaveNewProtocolObservable().subscribe((result) => {
            if (result.idProtocolSaved && result.savedProtocolClassName) {
                this.dialogRef.close({
                    reloadTree: true,
                    idProtocol: result.idProtocolSaved,
                    protocolClassName: result.savedProtocolClassName
                });
            } else {
                this.dialogRef.close({
                    reloadTree: true
                });
            }
        });
    }

    protected onClickCreateProtocolButton(): void {
        if (this.protocolName && this.protocolName !== ''
            && this.protocolClassName && this.protocolClassName !== '') {
            this.protocolService.saveNewProtocol(this.protocolName, '' + this.selectedExperimentPlatformCodeRequestCategory, this.protocolClassName, '' + this.selectedIdAnalysisType);
        }
    }
}