import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatDialogRef, MatDialog} from '@angular/material';
import {NewTopicComponent} from "../new-topic.component";
import {DeleteTopicComponent} from "../../topics/delete-topic.component";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {Router} from "@angular/router";
import {ITreeNode} from "angular-tree-component/dist/defs/api";

@Component({
    selector: 'menu-header-topics',
    template: `
        <div>
            <label style="width: 7rem; margin: 0 0 0 0.5rem"><img src="../../../assets/topic_tag.png" class="icon">Topics</label>
            <button mat-button [disabled]="!showNewTopic || this.disableAll" (click)="makeNewTopic()"><img src="../../../assets/topic_tag_new.png" class="icon">New Topic</button>
            <button [disabled]="(!showDelete && !showRemoveLink) || this.disableAll" mat-button (click)="doDelete()"><img src="../../../assets/crossout.png" class="icon">{{showRemoveLink ? 'Remove link' : 'Delete'}}</button>
            <button mat-button [disabled]="this.disableAll" (click)="doLinkToData()"><img src="../../../assets/link.png" class="icon">Link to Data</button>
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

    constructor(private dialog: MatDialog,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private router: Router) {
    }

    ngOnInit() {
        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }
    }

    public makeNewTopic(): void {
        // TODO depending on where the user has clicked in the topics tree, this dialog
        // needs to be provided with an idParentTopic and parentTopicLabel parameter
        this.dialog.open(NewTopicComponent, {
            height: '430px',
            width: '300px',
            data: {
                selectedItem: this.selectedNode,
                idParentTopic: this.idParentTopic,
                parentTopicLabel: this.parentTopicLabel
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.showNewTopic = !!this.selectedNode;
        this.showRemoveLink = this.selectedNode && this.selectedNode.isLeaf && !this.selectedNode.data.idParentTopic && this.selectedNode.parent.parent.data.canWrite === 'Y';
        this.showDelete = this.selectedNode && this.selectedNode.data.idTopic && this.selectedNode.data.canWrite === 'Y';
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
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.router.navigate(['/topics', { outlets: { topicsPanel: null }}]);
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
