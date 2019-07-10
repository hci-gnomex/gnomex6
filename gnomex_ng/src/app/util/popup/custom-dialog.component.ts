import {DialogPosition, MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {
    ChangeDetectorRef,
    Component, ElementRef,
    HostListener,
    Inject, OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from "@angular/core";
import {ActionType} from "../interfaces/generic-dialog-action.model";
import {ConstantsService} from "../../services/constants.service";

@Component({
    selector: "custom-dialog",
    template: `
        <div class="full-height full-width flex-container-col">
            <div *ngIf="this.title" class="full-width generic-dialog-header-colors no-margin no-padding">
                <div #topmostLeftmost mat-dialog-title (mousedown)="onMouseDownHeader($event)"
                     class="force-flex-container-row align-center full-width padding   {{ movingDialog ? 'grabbed' : 'grabbable' }}">
                    <div class="flex-container-row align-center padded">
                        <img  *ngIf="icon" class="icon" [src]="this.icon">
                        <div *ngIf="icon && icon.substr(0, 2) === '<i'" class="i-class" [innerHTML]="icon" ></div>
                        <h3 style="margin:0;">{{this.title}}</h3>
                    </div>
                    <div class="flex-grow"></div>
                    <div class="padded" (click)="onClose()">
                        <img class="exit" [src]="this.constService.ICON_BLUE_EXIT">
                    </div>
                </div>
            </div>
            <mat-dialog-content class="flex-grow no-margin no-padding" style="min-height: 6em;">
                <div #anchor></div>
            </mat-dialog-content>
            <mat-dialog-actions class="flex-container-row justify-center no-margin no-padding generic-dialog-footer-colors">
                <save-footer [actionType]="actionType.SECONDARY" class="centered-text" (saveClicked)="onClose()" name="Close"></save-footer>
            </mat-dialog-actions>
        </div>
    `,
    styles: [`
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

        .exit{
            max-width: 20px;
            cursor: pointer;
        }

        .i-class {
            margin-left:  0.3em;
            margin-right: 0.3em;
        }
    `]
})

export class CustomDialogComponent implements OnInit {
    @ViewChild("anchor", { read: ViewContainerRef }) _vcr;
    @ViewChild("topmostLeftmost") topmostLeftmost: ElementRef;

    public title: string = "";
    public icon: string = "";
    public actionType: any = ActionType;

    originalXClick: number = 0;
    originalYClick: number = 0;
    movingDialog: boolean = false;
    protected positionX: number = 0;
    protected positionY: number = 0;

    private tempRef: TemplateRef<any>;

    constructor(public dialogRef: MatDialogRef<CustomDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private changeDetector: ChangeDetectorRef,
                public constService: ConstantsService) {
        this.title = data.title;
        this.tempRef = data.templateRef;
        this.icon = data.icon;
    }

    ngOnInit() {
        this._vcr.createEmbeddedView(this.tempRef);
    }

    onClose() {
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
