import {AfterViewInit, Component, isDevMode, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogConfig} from "@angular/material";

import {throwError} from "rxjs";

import {DialogsService} from "../../util/popup/dialogs.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {ProtocolDialogComponent} from "./protocol-dialog.component";
import {first} from "rxjs/operators";


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
export class MaterialsMethodsTabComponent implements OnInit, AfterViewInit, OnDestroy {

    public requestCategoryName: string = "";
    public experimentCategoryName: string = "";
    public captureLibDesignId: string = "";
    public libDesignAndInsertBoxVisible: boolean = false;
    public designAndInsertLabel: string = "";
    public designAndInsertText: string = "";
    public codeIsolationPrepType: string = "";
    public selectedProtocol: any;
    public protocols: any[] = [];


    constructor(private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private protocolService: ProtocolService,
                private matDialog: MatDialog,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.data.forEach((data: any) => {
            let exp: any = data.experiment;
            if (exp && exp.Request) {
                this.getMaterialsMethodsData(exp.Request);
            } else {
                this.dialogService.alert("Cannot load experiment data", null);
                throwError(new Error("Cannot load experiment data"));
                return;
            }
        });

    }

    ngAfterViewInit () {
    }

    ngOnDestroy (): void {
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

    showProtocol(protocol: any): void {
        this.selectedProtocol = undefined;

        if (protocol.idProtocol && protocol.protocolClassName ) {
            this.protocolService.getProtocolByIdAndClass(protocol.idProtocol, protocol.protocolClassName);
            this.protocolService.getProtocolObservable().pipe(first()).subscribe((result) => {
                if (result) {
                    this.selectedProtocol = result;
                }
            }, error => {
                this.dialogService.alert("An exception occurred in GetProtocol:" + error.message, null);
            }, () => {
                if (this.selectedProtocol) {
                    this.openProtocolDialog();
                }
            });
        }

    }

    openProtocolDialog(): void {
        // Set and open MatDialog
        if (this.selectedProtocol) {
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "64em";
            configuration.height = "41em";
            configuration.panelClass = "no-padding-dialog";
            configuration.autoFocus = false;
            configuration.disableClose = true;

            configuration.data = {
                protocol: this.selectedProtocol
            };

            let protocolDialogRef = this.matDialog.open(ProtocolDialogComponent, configuration);
            protocolDialogRef.afterClosed().subscribe(() => {
                this.selectedProtocol = undefined;
            });
        }
    }

}
