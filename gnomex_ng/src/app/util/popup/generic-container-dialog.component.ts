import {
    Component,
    ElementRef,
    HostListener,
    Inject,
    OnInit,
    OnDestroy,
    ViewChild, ComponentRef, ChangeDetectorRef
} from "@angular/core";
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA, DialogPosition} from "@angular/material";

import {Router} from "@angular/router";
import {GDAction, GDActionConfig,ActionType} from "../interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "./base-generic-container-dialog";
import {UtilService} from "../../services/util.service";
import {ConstantsService} from "../../services/constants.service";

@Component({
    selector: 'generic-dialog-container',
    templateUrl: './generic-container-dialog.component.html',
    styles: [`
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
        .exit{
            max-width: 20px;
            cursor: pointer;
        }
        .force-flex-container-row{
            display:flex !important;
        }
        
        
    `]
})
export class GenericContainerDialogComponent implements OnInit, OnDestroy {

    @ViewChild('topmostLeftmost') topmostLeftmost: ElementRef;

    type = ActionType;
    title:string;
    icon:string;
    dialogContentBluePrint:any;
    actions: GDAction[] = [];
    originalXClick: number = 0;
    originalYClick: number = 0;
    dialogContent:BaseGenericContainerDialog;


    protected positionX: number = 0;
    protected positionY: number = 0;
    movingDialog: boolean = false;
    useSaveFooter: boolean;





    constructor(private dialog: MatDialog,
                private router: Router,
                public constService: ConstantsService,
                private utilService: UtilService,
                private changeDetector: ChangeDetectorRef,
                private dialogRef: MatDialogRef<GenericContainerDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
        if (data) {
            this.dialogContentBluePrint = data.dialogContent;
            this.icon = data.icon;
            this.title = data.title;
            this.useSaveFooter = data.actionConfig ? data.actionConfig.useSaveFooter : false;
            this.actions = data.actionConfig ? <GDAction[]>data.actionConfig.actions : [];

        }
    }

    ngOnInit() {
    }

    createdComponent(event:ComponentRef<any>){
        this.dialogContent = <BaseGenericContainerDialog>event.instance;
    }


    executeAction(action:GDAction):void{
        if(action.externalAction){
            action.externalAction();
        }
        if(action.internalAction){
            this.dialogContent[action.internalAction]();
        }
        console.log(action);
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
    @HostListener('window:mousemove', ['$event'])
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
                left:   '' + this.positionX + 'px',
                top:    '' + this.positionY + 'px',
            };

            this.dialogRef.updatePosition(newDialogPosition);
        }
    }
    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.movingDialog = false;
        this.changeDetector.reattach();
    }

    onClose($event){
        this.dialogRef.close();
    }

    ngOnDestroy() {
    }
}
