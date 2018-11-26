import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ActivatedRoute, Router} from "@angular/router";

import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";

import {Subscription} from "rxjs";

import {SpinnerDialogComponent} from "../util/popup/spinner-dialog.component";

import {DialogsService} from "../util/popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {ProtocolService} from "../services/protocol.service";
import {CreateProtocolDialogComponent} from "./create-protocol-dialog.component";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'manage-protocols',
    templateUrl: 'manage-protocols.component.html',
    styles: [`
        .flex-grow { flex: 1; }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }
        
        .inline-block { display: inline-block; }
        
        .vertical-center { vertical-align: middle; }
        
        .padded { padding: 0.4em; }
        
        .padded-right { padding-right: 0.4em; }
        
        .padded-left-right {
            padding-left: 0.4em;
            padding-right: 0.4em;
        }
        .padded-top-bottom {
            padding-top: 0.4em;
            padding-bottom: 0.4em;
        }
        
        .border { border: 1px lightgray solid; }

        .no-overflow { overflow: hidden; }
        .right-align { text-align: right; }
        
        .checkbox-container {
            display: inline-block;
            vertical-align: middle;
            width: fit-content;
            padding: 0.2em 0.6em 0 0.6em;
        }
        
        .minimize {
            width: fit-content;
        }
        
        .special-checkbox-text-alignment-padding {
            padding: 1.6em 0.6em 0 0;
        }
        .special-button-text-alignment-padding {
            padding: 1.1em 0.6em 0 0.6em;
        }
        
        .warning-block {
            background: yellow;
            border: 1px lightgray solid;
            border-radius: 4px;
        }
    `]
})
export class ManageProtocolsComponent implements OnInit, OnDestroy{

    @ViewChild("navigationTree") treeComponent: TreeComponent;

    private protocolSubscription: Subscription;
    private protocolListSubscription: Subscription;
    private saveProtocolSubscription: Subscription;
    private deleteProtocolSubscription: Subscription;

    private selectedProtocol: any;
    private protocolList: any[];

    protected mainPaneTitle: string = 'Protocol:';
    protected protocolType: string = '';
    protected protocolName: string = '';

    protected analysisTypeList: any[];
    protected userList: any[];

    private experimentPlatformList: any[];

    private treeOptions: ITreeOptions = {
        idField: "idComposite",
        displayField: "label",
        childrenField: "Protocol"
    };

    private treeModel: TreeModel;

    private mostRecentlySelectedTreeItem: any;

    private mostRecentlyDisplayedProtocolId: string;
    private mostRecentlyDisplayedProtocolProtocolClassName: string;

    public disableDelete: boolean = false;
    public disableNew: boolean = false;

    constructor(private dialog: MatDialog,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private protocolService: ProtocolService,
                private route: ActivatedRoute,
                private router: Router,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) { }

    ngOnInit(): void {
        this.treeModel = this.treeComponent.treeModel;

        if (this.createSecurityAdvisorService.isGuest) {
            this.disableDelete = true;
            this.disableNew = true;
        }

        if (!this.protocolSubscription) {
            this.protocolSubscription = this.protocolService.getProtocolObservable().subscribe((result) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
        }

        if (!this.protocolListSubscription) {
            this.protocolListSubscription = this.protocolService.getProtocolListObservable().subscribe((list) => {
                this.prepareTreeNodes(list);

                setTimeout(() => {
                    this.treeModel.expandAll();

                    this.dialogService.stopAllSpinnerDialogs();
                    if (this.treeModel && this.treeModel.getNodeById('' + this.mostRecentlyDisplayedProtocolId + this.mostRecentlyDisplayedProtocolProtocolClassName)) {
                        this.treeModel.getNodeById('' + this.mostRecentlyDisplayedProtocolId + this.mostRecentlyDisplayedProtocolProtocolClassName).setIsActive(true, false);
                    }
                });
            });

            setTimeout(() => {
                this.dialogService.startDefaultSpinnerDialog();

                this.protocolService.getProtocolList();
            });
        }

        if (!this.saveProtocolSubscription) {
            this.saveProtocolSubscription = this.protocolService.getSaveNewProtocolObservable().subscribe((result) => {
                if (result && result.idProtocolSaved && result.savedProtocolClassName) {
                    this.programaticallySelectTreeNode(result.idProtocolSaved, result.savedProtocolClassName);
                }
            });
        }

        if (!this.deleteProtocolSubscription) {
            this.deleteProtocolSubscription = this.protocolService.getDeleteProtocolObservable().subscribe((result) => {
                this.dialogService.stopAllSpinnerDialogs();

                this.selectedProtocol = null;
                this.mainPaneTitle = 'Protocol:';
                this.mostRecentlyDisplayedProtocolId = '';
                this.mostRecentlyDisplayedProtocolProtocolClassName = '';

                this.refresh();

                this.router.navigate(['/manage-protocols', { outlets: { 'browsePanel': ['overview'] } }]);
            });
        }

        this.experimentPlatformList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.analysisTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.userList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APP_USER);
    }

    ngOnDestroy(): void {
        if (this.protocolSubscription) {
            this.protocolSubscription.unsubscribe();
        }
        if (this.protocolListSubscription) {
            this.protocolListSubscription.unsubscribe();
        }
        if (this.saveProtocolSubscription) {
            this.saveProtocolSubscription.unsubscribe();
        }
        if (this.deleteProtocolSubscription) {
            this.deleteProtocolSubscription.unsubscribe();
        }
    }

    private prepareTreeNodes(list: any[]) {
        this.protocolList = list;
        this.mostRecentlySelectedTreeItem = null;

        if (this.protocolList) {
            for (let protocolFolder of this.protocolList) {
                protocolFolder.icon = '../../assets/folder.png';
                protocolFolder.isProtocol = 'N';
                protocolFolder.idComposite = '' + protocolFolder.protocolClassName;
                protocolFolder.protocolType = '' + protocolFolder.label;
                protocolFolder.protocolClassName = '' + protocolFolder.protocolClassName;

                if (!this.mostRecentlySelectedTreeItem) {
                    this.mostRecentlySelectedTreeItem = protocolFolder;
                }

                if(!!protocolFolder.Protocol) {
                    if (!Array.isArray(protocolFolder.Protocol)) {
                        protocolFolder.Protocol = [protocolFolder.Protocol];
                    }

                    for (let protocol of protocolFolder.Protocol) {
                        protocol.icon = '../../assets/brick.png';
                        protocol.isProtocol = 'Y';
                        protocol.idComposite = '' + protocol.id + protocolFolder.protocolClassName;

                        protocol.protocolType = '' + protocolFolder.label;
                        protocol.protocolClassName = '' + protocolFolder.protocolClassName
                    }
                }
            }
        }
    }

    private treeOnSelect(event: any): void {
        if (event
            && event.node
            && event.node.data
            && event.node.data.id
            && event.node.data.protocolClassName
            && event.node.data.isProtocol
            && event.node.data.isProtocol === 'Y') {

            if (this.mostRecentlyDisplayedProtocolId === event.node.data.id
                && this.mostRecentlyDisplayedProtocolProtocolClassName === event.node.data.protocolClassName) {
                return;
            }

            this.dialogService.startDefaultSpinnerDialog();

            this.mostRecentlyDisplayedProtocolId                = event.node.data.id;
            this.mostRecentlyDisplayedProtocolProtocolClassName = event.node.data.protocolClassName;

            if (event.node.parent
                && event.node.parent.data
                && event.node.data
                && event.node.data.label
                && event.node.data.label !== '') {
                this.protocolType = event.node.parent.data.label;
                this.protocolName = event.node.data.label;
                this.mainPaneTitle = '' + event.node.parent.data.label + ': ' + event.node.data.label;
            }

            setTimeout(() => {
                this.router.navigate([
                    '/manage-protocols',
                    {
                        outlets: {
                            'browsePanel': ['details', event.node.data.protocolClassName,  event.node.data.id]
                        }
                    }
                ]);
            });
        } else {
            this.mainPaneTitle = 'Protocol:'
        }

        if (event && event.node && event.node.data) {
            this.mostRecentlySelectedTreeItem = event.node.data;
        }
    }

    private programaticallySelectTreeNode(idProtocol: string, protocolClassName: string): void {
        setTimeout(() => {
            if (this.treeModel && this.treeModel.getNodeById('' + idProtocol + protocolClassName)) {
                // this.mostRecentlyDisplayedProtocolId                = idProtocol;
                // this.mostRecentlyDisplayedProtocolProtocolClassName = protocolClassName;

                // this.treeModel.getNodeById('' + this.mostRecentlyDisplayedProtocolId + this.mostRecentlyDisplayedProtocolProtocolClassName).setIsActive(true, false);
                this.treeModel.getNodeById('' + idProtocol + protocolClassName).setIsActive(true, false);
            }
        });
    }

    private onNewProtocolButtonClicked() {

        let data: any = {
            protocolType: '',
            protocolClassName : ''
        };

        if (!!this.mostRecentlySelectedTreeItem) {
            data.protocolType      = this.mostRecentlySelectedTreeItem.protocolType;
            data.protocolClassName = this.mostRecentlySelectedTreeItem.protocolClassName;
        }

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '30em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = data;

        let dialogReference = this.dialog.open(CreateProtocolDialogComponent, configuration);

        dialogReference.afterClosed().subscribe((result) => {
            if (result
                && result.reloadTree
                && result.idProtocol
                && result.idProtocol !== ''
                && result.protocolClassName
                && result.protocolClassName !== '') {

                this.mostRecentlyDisplayedProtocolId = result.idProtocol;
                this.mostRecentlyDisplayedProtocolProtocolClassName = result.protocolClassName;
                this.refresh();
            } else {
                // Assume that the popup closed by cancelling. Do nothing.
            }
        });
    }
    private onDeleteProtocolButtonClicked() {
        if (this.mostRecentlyDisplayedProtocolId
            && this.mostRecentlyDisplayedProtocolId !== ''
            && this.mostRecentlyDisplayedProtocolProtocolClassName
            && this.mostRecentlyDisplayedProtocolProtocolClassName !== '') {

            let lines: string[] = [
                "Are you sure you want to delete the ",
                "" + this.protocolType + ":",
                "" + this.protocolName + "?"
            ];

            this.dialogService.yesNoDialog(lines, this, "onConfirmDelete")
        }
    }
    private onConfirmDelete() {
        if (this.mostRecentlyDisplayedProtocolId
            && this.mostRecentlyDisplayedProtocolId !== ''
            && this.mostRecentlyDisplayedProtocolProtocolClassName
            && this.mostRecentlyDisplayedProtocolProtocolClassName !== '') {
            this.dialogService.startDefaultSpinnerDialog();
            setTimeout(() => {
                this.protocolService.deleteProtocol(this.mostRecentlyDisplayedProtocolId, this.mostRecentlyDisplayedProtocolProtocolClassName);
            });
        } else {
            this.dialogService.alert("Error : No selected protocol");
        }
    }
    private onRefreshButtonClicked() {
        this.refresh();
    }

    private refresh(): void {
        this.dialogService.startDefaultSpinnerDialog();

        setTimeout(() => {
            if (this.mostRecentlyDisplayedProtocolProtocolClassName && this.mostRecentlyDisplayedProtocolId) {
                this.router.navigate([
                    '/manage-protocols',
                    {
                        outlets: {
                            'browsePanel': [
                                'details',
                                this.mostRecentlyDisplayedProtocolProtocolClassName,
                                this.mostRecentlyDisplayedProtocolId
                            ]
                        }
                    }
                ]);
            }

            if (this.mostRecentlyDisplayedProtocolId && this.mostRecentlyDisplayedProtocolProtocolClassName) {
                this.protocolService.getProtocolByIdAndClass(this.mostRecentlyDisplayedProtocolId, this.mostRecentlyDisplayedProtocolProtocolClassName);
            }

            this.protocolService.getProtocolList();
        });
    }
}