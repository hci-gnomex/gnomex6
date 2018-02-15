import {Component, Input, SimpleChanges} from '@angular/core';

import {MatDialogRef, MatDialog} from '@angular/material';
import {NewTopicComponent} from "../new-topic.component";
import {DeleteTopicComponent} from "../../topics/delete-topic.component";

@Component({
    selector: 'menu-header-topics',
    templateUrl: "./menu-header-topics.component.html"
})

export class MenuHeaderTopicsComponent {
    @Input() selectedNode: any;

    private idParentTopic = "";
    private parentTopicLabel = "";
    public showDelete: boolean = false;
    public showRemoveLink: boolean = false;
    public showNewTopic: boolean = false;

    constructor(private dialog: MatDialog) {
    }

    public makeNewTopic(): void {
        // TODO depending on where the user has clicked in the topics tree, this dialog
        // needs to be provided with an idParentTopic and parentTopicLabel parameter
        let dialogRef: MatDialogRef<NewTopicComponent> = this.dialog.open(NewTopicComponent, {
            height: '430px',
            width: '300px',
            data: {
                selectedItem: this.selectedNode,
                idParentTopic: this.idParentTopic,
                parentTopicLabel: this.parentTopicLabel
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.selectedNode) {
            this.showNewTopic = true;
            this.removeLinkEnabled();
        }
    }

    public removeLinkEnabled() {
        if ((this.selectedNode.isLeaf && this.selectedNode.data.idParentTopic === undefined))  {
            this.showRemoveLink = true;
            this.showDelete = false;
        } else {
            this.deleteEnabled();
        }
    }

    public deleteEnabled() {
        if (this.selectedNode.data.Request || this.selectedNode.data.Analysis || this.selectedNode.data.DataTrack) {
            this.showRemoveLink = false;
            this.showDelete = false;
        } else if (this.selectedNode.data.idTopic) {
            this.showRemoveLink = false;
            this.showDelete = true;
        } else if (this.selectedNode.id = "topic") {
            this.showRemoveLink = false;
            this.showDelete = false;
        }
    }

    public doDelete(): void {
        let dialogRef: MatDialogRef<DeleteTopicComponent> = this.dialog.open(DeleteTopicComponent, {
            height: '250px',
            width: '400px',
            data: {
                selectedItem: this.selectedNode,
                idTopic: this.selectedNode.data.idTopic,
                topic: this.selectedNode.parent.parent.data
            }
        });
    }

    public doLinkToData(): void {
        // TODO
    }

    public doRefresh(): void {
        // TODO
    }

}
