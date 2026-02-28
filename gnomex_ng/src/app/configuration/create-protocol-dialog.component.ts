import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DictionaryService} from "../services/dictionary.service";
import {ProtocolService} from "../services/protocol.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'create-protocol-dialog',
    template: `
        <div class="flex-container-col full-width full-height double-padded">
            <div class="full-width">
                <mat-form-field class="full-width">
                    <input  matInput
                            placeholder="Protocol Name"
                            [(ngModel)]="protocolName"
                            required>
                </mat-form-field>
            </div>
            <div *ngIf="protocolClassName && protocolClassName !== 'hci.gnomex.model.AnalysisProtocol'" class="full-width">
                <custom-combo-box class="full-width" placeholder="Experiment Platform" displayField="display"
                                  [options]="experimentPlatformList" valueField="codeRequestCategory"
                                  [(ngModel)]="selectedExperimentPlatformCodeRequestCategory">
                </custom-combo-box>
            </div>
            <div *ngIf="protocolClassName && protocolClassName === 'hci.gnomex.model.AnalysisProtocol'" class="full-width">
                <custom-combo-box class="full-width" placeholder="Analysis Type" displayField="display"
                                  [options]="analysisTypeList" valueField="idAnalysisType"
                                  [(ngModel)]="selectedIdAnalysisType">
                </custom-combo-box>
            </div>
        </div>
    `,
})
export class CreateProtocolDialogComponent extends BaseGenericContainerDialog implements OnInit {

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
        super();
        if (data && data.protocolType && data.protocolClassName) {
            this.innerTitle = "Create New " + data.protocolType;
            this.protocolClassName = data.protocolClassName;
        } else {
            this.dialogRef.close();
        }

        this.analysisTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
    }

    ngOnInit(): void {
        this.primaryDisable = (action) => {
            return !this.protocolName;
        };

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
        if (this.protocolName && this.protocolClassName) {
            this.protocolService.saveNewProtocol(this.protocolName, '' + this.selectedExperimentPlatformCodeRequestCategory, this.protocolClassName, '' + this.selectedIdAnalysisType);
        }
    }
}
