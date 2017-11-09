import {Component} from '@angular/core';

import {MatDialogRef, MatDialog} from '@angular/material';
import {NewTopicComponent} from "../new-topic.component";

@Component({
    selector: 'menu-header-topics',
    templateUrl: "./menu-header-topics.component.html"
})

export class MenuHeaderTopicsComponent {

    private idParentTopic = "";
    private parentTopicLabel = "";

    constructor(private dialog: MatDialog) {
    }

    public makeNewTopic(): void {
        // TODO depending on where the user has clicked in the topics tree, this dialog
        // needs to be provided with an idParentTopic and parentTopicLabel parameter
        let dialogRef: MatDialogRef<NewTopicComponent> = this.dialog.open(NewTopicComponent, {
            data: {
                idParentTopic: this.idParentTopic,
                parentTopicLabel: this.parentTopicLabel
            }
        });
    }

    public doDelete(): void {
        // TODO
    }

    public doLinkToData(): void {
        // TODO
    }

    public doRefresh(): void {
        // TODO
    }

}
