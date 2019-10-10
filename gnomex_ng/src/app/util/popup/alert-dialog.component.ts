import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Inject, OnInit,
    ViewChild,
} from "@angular/core";
import {DialogPosition, MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ActionType} from "../interfaces/generic-dialog-action.model";
import {DialogType} from "./dialogs.service";

@Component({
    selector: "alert-dialog",
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="full-width dialog-header-colors no-margin no-padding">
                <div #topmostLeftmost mat-dialog-title (mousedown)="onMouseDownHeader($event)"
                     class="force-flex-container-row align-center full-width padding   {{ movingDialog ? 'grabbed' : 'grabbable' }}">
                    <div class="flex-container-row align-center padded">
                        <img *ngIf="icon" class="icon" [src]="this.icon">
                        <div *ngIf="!icon">
                            <i *ngIf="dialogType === type.ALERT" class="fa fa-exclamation fa-2x i-margin i-color-blue"></i>
                            <i *ngIf="dialogType === type.SUCCESS" class="fa fa-check-circle fa-2x i-margin i-color-blue"></i>
                            <i *ngIf="dialogType === type.FAILED || dialogType === type.ERROR" class="fa fa-exclamation-triangle fa-2x i-margin i-color-red"></i>
                            <i *ngIf="dialogType === type.WARNING || dialogType === type.VALIDATION" class="fa fa-exclamation-triangle fa-2x i-margin i-color-blue"></i>
                            <i *ngIf="dialogType === type.INFO" class="fa fa-info-circle fa-2x i-margin i-color-blue"></i>
                            <i *ngIf="dialogType === type.CONFIRM" class="fa fa-check fa-2x i-margin i-color-blue"></i>
                        </div>
                        <h1 *ngIf="dialogType !== type.ERROR"
                            style="margin:0;">{{this.title ? this.title : defaultTitle}}</h1>
                        <h1 *ngIf="dialogType === type.ERROR"
                            style="margin:0; color: Red">{{this.title ? this.title : defaultTitle}}</h1>
                    </div>
                </div>
            </div>
            <mat-dialog-content class="flex-grow no-margin no-padding" style="min-height: 6em;">
                <hr>
                <div *ngIf="message.length === 1"
                     class="flex-grow full-height full-width extra-padded message overflow-auto"
                     [innerHTML]="message"></div>
                <div *ngIf="message.length > 1"
                     class="flex-grow full-height full-width extra-padded message overflow-auto">
                    <div *ngFor="let line of message" class="full-width">
                        {{ line }}
                    </div>
                </div>
            </mat-dialog-content>
            <mat-dialog-actions class="flex-container-row justify-center no-margin no-padding">
                <save-footer *ngIf="dialogType !== type.CONFIRM" class="centered-text large-size"
                             (saveClicked)="onClickOk()" name="Ok"></save-footer>
                <save-footer *ngIf="dialogType === type.CONFIRM" class="centered-text large-size"
                             (saveClicked)="onClickYes()" name="Yes"></save-footer>
                <save-footer *ngIf="dialogType === type.CONFIRM" [actionType]="actionType"
                             class="centered-text large-size" (saveClicked)="onClickNo()"
                             name="No"></save-footer>
            </mat-dialog-actions>
        </div>
    `,
    styles: [`
        hr {
            width: 98%;
        }

        .i-margin {
            margin-left:  0.3em;
            margin-right: 0.3em;
        }
        .i-color-blue {
            color: var(--bluewarmvivid-medlight);
        }
        .i-color-red  {
            color: red;
        }

        .centered-text { text-align: center; }

        .no-padding{
            padding:0;

        }

        .no-margin{
            margin: 0;
        }

        .grabbable {
            cursor: move;
            cursor: grab;
            cursor: -moz-grab;
            cursor: -webkit-grab;
        }
        .grabbed {
            cursor: move;
            cursor: grabbing;
            cursor: -moz-grabbing;
            cursor: -webkit-grabbing;
        }

        .force-flex-container-row{
            display:flex !important;
        }
        .extra-padded {
            padding: 0.6em 0.9em 0.6em 0.9em;
        }
        .large-size {
            font-size: large;
        }
        .primary-action {
            font-size: large;
        }
        .secondary-action {
            font-size: large;
        }
        .message {
            color: var(--bluecool-darkest);
        }
    `]
}) export class AlertDialogComponent implements OnInit {
    public type: any = DialogType;

    @ViewChild("topmostLeftmost") topmostLeftmost: ElementRef;

    public message: string[] = null;
    public title: string = "";
    public icon: string = "";
    public dialogType: string = "";
    public defaultTitle: string = "";
    public actionType: any = ActionType.SECONDARY;

    originalXClick: number = 0;
    originalYClick: number = 0;
    protected positionX: number = 0;
    protected positionY: number = 0;
    movingDialog: boolean = false;

    constructor(public dialogRef: MatDialogRef<AlertDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data,
                private changeDetector: ChangeDetectorRef) {
        if(data) {
            this.message = Array.isArray(data.message) ? data.message : [data.message];
            this.title = data.title;
            this.icon = data.icon;
            this.dialogType = data.dialogType;
        }
    }

    ngOnInit(): void {
        if(this.dialogType) {
            this.defaultTitle = this.dialogType;
        }
    }

    onClickOk(): void {
        this.dialogRef.close(true);
    }

    onClickYes(): void {
        this.dialogRef.close(true);
    }

    onClickNo(): void {
        this.dialogRef.close();
    }

    onMouseDownHeader(event: any): void {
        if (!event) {
            return;
        }

        this.positionX = this.topmostLeftmost.nativeElement.offsetLeft;
        this.positionY = this.topmostLeftmost.nativeElement.offsetTop;

        this.originalXClick = event.screenX;
        this.originalYClick = event.screenY;

        this.movingDialog = true;
        this.changeDetector.detach();
    }
    @HostListener("window:mousemove", ["$event"])
    onMouseMove(event: any): void {
        if (!event) {
            return;
        }

        if (this.movingDialog) {
            this.positionX += event.screenX - this.originalXClick;
            this.positionY += event.screenY - this.originalYClick;

            this.originalXClick = event.screenX;
            this.originalYClick = event.screenY;

            let newDialogPosition: DialogPosition = {
                left:   "" + this.positionX + "px",
                top:    "" + this.positionY + "px",
            };

            this.dialogRef.updatePosition(newDialogPosition);
        }
    }
    @HostListener("window:mouseup", ["$event"])
    onMouseUp(): void {
        this.movingDialog = false;
        this.changeDetector.reattach();
    }
}
