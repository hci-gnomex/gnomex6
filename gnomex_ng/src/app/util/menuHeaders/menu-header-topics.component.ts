import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatDialogConfig} from '@angular/material';
import {NewTopicComponent} from "../new-topic.component";
import {DeleteTopicComponent} from "../../topics/delete-topic.component";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {Router} from "@angular/router";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../popup/dialogs.service";
import {ConstantsService} from "../../services/constants.service";
import {ActionType} from "../interfaces/generic-dialog-action.model";

@Component({
    selector: 'menu-header-topics',
    template: `
        <div>
            <label style="width: 7rem; margin: 0 0 0 0.5rem"><img [src]="'./assets/topic_tag.png'" class="icon">Topics</label>
            <button mat-button [disabled]="!showNewTopic || this.disableAll" (click)="makeNewTopic()"><img [src]="'./assets/topic_tag_new.png'" class="icon">New Topic</button>
            <button [disabled]="(!showDelete && !showRemoveLink) || this.disableAll" mat-button (click)="doDelete()"><img [src]="'./assets/crossout.png'" class="icon">{{showRemoveLink ? 'Remove link' : 'Delete'}}</button>
            <button mat-button [disabled]="this.disableAll" (click)="doLinkToData()"><img [src]="'./assets/link.png'" class="icon">Link to Data</button>
        </div>
    `
})

export class MenuHeaderTopicsComponent implements OnInit {
    @Input() selectedNode: ITreeNode;

    private idParentTopic = "";
    private parentTopicLabel = "";
    public showDelete: boolean = false;
    public showRemoveLink: boolean = false;
    public showNewTopic: boolean = false;
    public disableAll: boolean = false;

    @Output() messageEvent = new EventEmitter<string>();

    constructor(private dialogsService: DialogsService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private router: Router,
                private constantsService: ConstantsService) {
    }

    ngOnInit() {
        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }
    }

    public makeNewTopic(): void {
        // TODO depending on where the user has clicked in the topics tree, this dialog
        // needs to be provided with an idParentTopic and parentTopicLabel parameter
        let title: string;
        if (!this.selectedNode || !this.selectedNode.data.idTopic) {
            title = " Add New Top Level Topic";
        } else {
            title = " Add Subtopic of " + this.selectedNode.parent.data.label;
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.data = {
            selectedItem: this.selectedNode,
            idParentTopic: this.idParentTopic,
            parentTopicLabel: this.parentTopicLabel
        };

        this.dialogsService.genericDialogContainer(NewTopicComponent, title, this.constantsService.ICON_TOPIC, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
                    if(result) {
                        // TODO: Navigate to the new created topic
                    }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.showNewTopic = !!this.selectedNode;
        this.showRemoveLink = this.selectedNode && this.selectedNode.isLeaf && !this.selectedNode.data.idParentTopic && this.selectedNode.parent.parent.data.canWrite === 'Y';
        this.showDelete = this.selectedNode && this.selectedNode.data.idTopic && this.selectedNode.data.canWrite === 'Y';
    }

    public doDelete(): void {
        let title: string = "Confirm: " + (this.showRemoveLink ? "Remove Link" : "Delete Topic");
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.height = "15em";
        config.data = {
            selectedItem: this.selectedNode,
            idTopic: this.selectedNode.data.idTopic,
            topic: this.selectedNode.parent.parent.data
        };
        this.dialogsService.genericDialogContainer(DeleteTopicComponent, title, this.constantsService.ICON_EXCLAMATION, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "delete"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
                    if (result) {
                        this.router.navigate(["/topics", {outlets: {topicsPanel: null}}]);
                        this.selectedNode = null;
                        this.ngOnChanges(null);
                    }
        });
    }

    public doLinkToData(): void {
        this.messageEvent.emit("startLinkToData");
        // TODO
    }

}
