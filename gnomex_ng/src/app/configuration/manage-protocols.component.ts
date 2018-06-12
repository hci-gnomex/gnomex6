import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProtocolService} from "../services/protocol.service";
import {Subscription} from "rxjs/Subscription";
import {ITreeOptions} from "angular-tree-component";
import {DictionaryService} from "../services/dictionary.service";

@Component({
    selector: 'manage-protocols',
    templateUrl: 'manage-protocols.component.html',
    styles: [`
        .flex-grow { flex: 1; }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }
        
        .vertical-center { vertical-align: middle; }
        
        .padded { padding: 0.6em; }
        
        .padded-right { padding-right: 0.6em; }
        
        .padded-left-right {
            padding-left: 0.6em;
            padding-right: 0.6em;
        }
        .padded-top-bottom {
            padding-top: 0.6em;
            padding-bottom: 0.6em;
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
        
        .special-checkbox-text-alignment-padding {
            padding: 1.6em 0.6em 0 0;
        }
    `]
})
export class ManageProtocolsComponent implements OnInit, OnDestroy{

    private protocolSubscription: Subscription;
    private protocolListSubscription: Subscription;

    private selectedProtocol: any;
    private protocolList: any[];

    private selectedProtocolName: string;
    private selectedProtocolUrl: string;

    private selectedExperimentPlatform: any;
    private experimentPlatformList: any[];

    private activeCheckBox: boolean = false;

    private treeOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "Protocol"
    };

    constructor(private protocolService: ProtocolService,
                private dictionaryService: DictionaryService) { }

    ngOnInit(): void {
        if (!this.protocolSubscription) {
            this.protocolSubscription = this.protocolService.getProtocolObservable().subscribe((result) => {
                this.selectedProtocol = result;
                this.selectedProtocolName = result.name;
                this.selectedProtocolUrl  = result.url;
                this.activeCheckBox       = ('' + result.isActive).toLowerCase() === 'y';
            });
        }

        if (!this.protocolListSubscription) {
            this.protocolListSubscription = this.protocolService.getProtocolListObservable().subscribe((list) => {
                this.prepareTreeNodes(list);
            });

            this.protocolService.getProtocolList();
        }

        this.experimentPlatformList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        //this.dictionaryService.getEntries(DictionaryService.);
    }

    ngOnDestroy(): void {
        if (this.protocolListSubscription) {
            this.protocolListSubscription.unsubscribe();
        }
    }

    private prepareTreeNodes(list: any[]) {
        this.protocolList = list;

        if (this.protocolList) {
            for (let protocolFolder of this.protocolList) {
                protocolFolder.icon = '../../assets/folder.png';
                protocolFolder.isProtocol = 'N';

                if(!!protocolFolder.Protocol) {
                    if (!Array.isArray(protocolFolder.Protocol)) {
                        protocolFolder.Protocol = [protocolFolder.Protocol];
                    }

                    for (let protocol of protocolFolder.Protocol) {
                        protocol.icon = '../../assets/brick.png';
                        protocol.isProtocol = 'Y';
                    }
                }
            }
        }
    }

    private treeOnSelect(event: any) {
        if (event
            && event.node
            && event.node.data
            && event.node.data.id
            && event.node.data.protocolClassName
            && event.node.data.isProtocol
            && event.node.data.isProtocol === 'Y') {
            this.protocolService.getProtocolByIdAndClass(event.node.data.id, event.node.data.protocolClassName);
        }
    }

    private onNewProtocolButtonClicked() {

    }
    private onDeleteProtocolButtonClicked() {

    }
    private onRefreshButtonClicked() {
        console.log('Refresh button clicked : ' + this.protocolList);
    }
    private onSaveButtonClicked() {

    }

}