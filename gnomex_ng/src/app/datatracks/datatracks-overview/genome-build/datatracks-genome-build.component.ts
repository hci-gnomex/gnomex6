import {Component, OnInit, ViewChild} from "@angular/core";
import {TabContainer} from "../../../util/tabs/tab-container.component";
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {DataTrackService} from "../../../services/data-track.service";
import {DialogsService, DialogType} from "../../../util/popup/dialogs.service";
import {MatTabChangeEvent} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../../util/interfaces/gnomex-error.response.model";


@Component({

    template: `
        <div style="display:flex; flex-direction:column; height:100%; width:100%;">

            <div style="padding-bottom: .5em;padding-left:1em;">
                <img [src]="dtService.datatrackListTreeNode.icon">Genome Build: {{dtService.datatrackListTreeNode.label}}
            </div>
            <div class="overflow-auto" style="display:flex; flex: 1;">

                <mat-tab-group style="height:100%; width:100%;" class="mat-tab-group-border" (selectedTabChange)="tabChanged($event)">
                    <mat-tab style="height:100%" label="Details">
                        <gb-detail></gb-detail>
                    </mat-tab>
                    <mat-tab style="height:100%" label="Segments">
                        <gb-segment></gb-segment>
                    </mat-tab>
                    <mat-tab style="height:100%;" label="Sequences Files">
                        <gb-sequence-files-tab></gb-sequence-files-tab>
                    </mat-tab>
                </mat-tab-group>
            </div>
            <div>
                <save-footer (saveClicked)="save()" [disableSave]="!canWrite" [dirty]="gbValidateService.dirtyNote" ></save-footer>
            </div>

        </div>
    `,
    styles: [`
        .flex-container{
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }
    `]
})
export class DatatracksGenomeBuildComponent implements OnInit {
    //Override
    public componentNames: Array<String>;
    public state: string = TabContainer.VIEW;
    @ViewChild(TabContainer) tabs: TabContainer;
    public canWrite: boolean = false;


    constructor(public gbValidateService: GenomeBuildValidateService,
                public dtService: DataTrackService, private dialogService: DialogsService) {

    }

    ngOnInit(): void {
        this.componentNames = ["GBDetailTabComponent", "GBSegmentsTabComponent", "GBSequenceFilesTabComponent"];
        this.canWrite = this.dtService.datatrackListTreeNode.canWrite === "Y";

    }

    tabChanged(event: MatTabChangeEvent) {
    }

    save(): void {
        let params: HttpParams = new HttpParams();

        this.gbValidateService.emitValidateGenomeBuild();

        let messageList: Array<string> = this.gbValidateService.errorMessageList;

        if(messageList.length > 0) {
            this.dialogService.alert(messageList.join("\n"), null, DialogType.VALIDATION);
        } else {
            let segsObj = this.gbValidateService.segmentsList;
            let seqFilesObj = this.gbValidateService.sequenceFilesList;
            let idGenomeBuild: string = this.dtService.datatrackListTreeNode.idGenomeBuild;

            params = params.set("idGenomeBuild", idGenomeBuild);
            if(segsObj.length > 0) {
                params = params.set("segmentsXML", JSON.stringify(segsObj));
            }
            if(seqFilesObj.length > 0) {
                params = params.set("sequenceFilesToRemoveXML", JSON.stringify(seqFilesObj));
            }


            Object.keys(this.gbValidateService.detailsForm).forEach(key => {
                if(key === "isActive") {
                    let value: string = this.gbValidateService.detailsForm[key] === true ? "Y" : "N";
                    params = params.set(key, value);
                } else if(key === "buildDate") {
                    let date: Date = <Date>this.gbValidateService.detailsForm.buildDate;
                    params = params.set("buildDate", date.toLocaleDateString());
                } else {
                    params = params.set(key, this.gbValidateService.detailsForm[key]);
                }

            });

            this.dtService.saveGenomeBuild(params).subscribe(() => {
                this.dtService.activeNodeToSelect = {
                    attribute: "idGenomeBuild",
                    value: idGenomeBuild
                };
                 this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
            },(err:IGnomexErrorResponse) => {
            });
        }


        this.gbValidateService.resetValidation();

    }

}




