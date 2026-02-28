import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogConfig} from "@angular/material";

import {throwError} from "rxjs";

import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {ProtocolDialogComponent} from "./protocol-dialog.component";
import {first} from "rxjs/operators";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {UserPreferencesService} from "../../services/user-preferences.service";


@Component({
    selector: "materials-methods-tab",
    templateUrl: "./materials-methods-tab.component.html",
    styles: [`
        .minor-padded {
            padding: 0.6em;
        }

        .gx-label{
            color: darkblue;
        }

        .label-width {
            width: 8rem;
        }

        .minor-label-width {
            width: 7rem;
        }

        .limit-width {
            max-width: 100%;
        }
    `],
})
export class MaterialsMethodsTabComponent implements OnInit {

    public requestCategoryName: string = "";
    public experimentCategoryName: string = "";
    public captureLibDesignId: string = "";
    public libDesignAndInsertBoxVisible: boolean = false;
    public designAndInsertLabel: string = "";
    public designAndInsertText: string = "";
    public codeIsolationPrepType: string = "";
    public protocols: any[] = [];
    public _experiment: any = {};
    public libraryPreparedBy: string = "";


    constructor(private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private protocolService: ProtocolService,
                private matDialog: MatDialog,
                private route: ActivatedRoute,
                private prefService: UserPreferencesService) {
    }

    ngOnInit() {
        this.route.data.forEach((data: any) => {
            let exp: any = data.experiment;
            if (exp && exp.Request) {
                this._experiment = exp.Request;
                this.getMaterialsMethodsData(exp.Request);
                this.getLibraryPreparer();
            } else {
                this.dialogService.alert("Cannot load experiment data", null, DialogType.FAILED);
                throwError(new Error("Cannot load experiment data"));
                return;
            }
        });

    }

    getMaterialsMethodsData(experiment: any): void {
        // requestCategoryName
        this.requestCategoryName = "";
        if (experiment.codeRequestCategory) {
            this.requestCategoryName = this.dictionaryService.getEntryDisplay("hci.gnomex.model.RequestCategory", experiment.codeRequestCategory);
        }

        // libDesignAndInsertBox
        if (experiment.captureLibDesignId) {
            this.libDesignAndInsertBoxVisible = true;
            this.designAndInsertLabel = "Custom Design Id";
            this.designAndInsertText = experiment.captureLibDesignId;
        } else {
            this.libDesignAndInsertBoxVisible = false;
        }

        // codeIsolationPrepType
        this.codeIsolationPrepType = "";
        if (experiment.codeIsolationPrepType) {
            this.codeIsolationPrepType = this.dictionaryService.getEntryDisplay("hci.gnomex.model.IsolationPrepType", experiment.codeIsolationPrepType);
        }

        // protocols
        this.protocols = [];
        if (experiment.protocols) {
            if (Array.isArray(experiment.protocols)) {
                this.protocols = experiment.protocols;
            } else {
                this.protocols = [experiment.protocols.Protocol];
            }
        }

        // experimentCategoryName
        this.experimentCategoryName = "";
        if ((!experiment.protocols || this.protocols.length <= 0) && experiment.codeApplication) {
            this.experimentCategoryName = this.dictionaryService.getEntryDisplay("hci.gnomex.model.Application", experiment.codeApplication);

            if (experiment.codeApplication && experiment.codeApplication === "OTHER" && experiment.applicationNotes) {
                this.experimentCategoryName = this.experimentCategoryName + " - " + experiment.applicationNotes;
            }
        }

    }

    getLibraryPreparer(): void {
        if (this._experiment && this._experiment.samples) {

            let samplesRef: any[] = Array.isArray(this._experiment.samples) ? this._experiment.samples : [this._experiment.samples.Sample];
            let addedIds: string[] = [];

            this.libraryPreparedBy = "";

            for (let sample of samplesRef) {
                if (sample.idLibPrepPerformedBy && !addedIds.find((a) => { return a === sample.idLibPrepPerformedBy}) ) {
                    let libraryPreparer: any = this.dictionaryService.getEntry("hci.gnomex.model.AppUserLite", sample.idLibPrepPerformedBy);

                    if (libraryPreparer && (libraryPreparer.firstName || libraryPreparer.lastName)) {
                        if (this.libraryPreparedBy.length > 0) {
                            this.libraryPreparedBy += "\n";
                        }
                        this.libraryPreparedBy += this.prefService.formatUserName(libraryPreparer.firstName, libraryPreparer.lastName);
                    }

                    addedIds.push("" + sample.idLibPrepPerformedBy);
                }
            }
        }
    }

    showProtocol(protocol: any): void {

        if (protocol.idProtocol && protocol.protocolClassName ) {
            this.protocolService.getProtocolByIdAndClass(protocol.idProtocol, protocol.protocolClassName);
            this.protocolService.getProtocolObservable().pipe(first()).subscribe((result: any) => {
                if (result) {
                    this.openProtocolDialog(result, protocol.name);
                }
            }, (error: IGnomexErrorResponse) => {
                this.dialogService.error("An exception occurred in GetProtocol:" + error.message);
            });
        }

    }

    private openProtocolDialog(protocol: any, protocolName: string): void {
        if (protocol) {
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "64em";
            configuration.height = "41em";
            configuration.panelClass = "no-padding-dialog";
            configuration.autoFocus = false;
            configuration.disableClose = true;

            configuration.data = {
                protocol: protocol
            };

            this.dialogService.genericDialogContainer(ProtocolDialogComponent, protocolName, null, configuration,
                {actions: [
                        {type: ActionType.SECONDARY, name: "Close", internalAction: "close"}
                    ]});
        }
    }

}
