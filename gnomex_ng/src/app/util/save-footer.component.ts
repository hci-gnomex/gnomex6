import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {DialogsService} from "./popup/dialogs.service";
import {ActionType} from "./interfaces/generic-dialog-action.model";

@Component({
    selector: 'save-footer',
    template: `
        <div class="full-height full-width">
            <div class="flex-container-row align-center right-align padded">
                <div *ngIf="dirty" class="warning-background padded">
                    {{ message }}
                </div>
                <div class="major-left-right-margin">
                    <button mat-raised-button [disabled]="disableSave"
                            [color]="actionType" (click)="notifySave()"
                            [ngClass]="{'primary-action': actionType === type.PRIMARY,
                                        'secondary-action': actionType === type.SECONDARY && !disableSave }">
                        <img *ngIf="icon" [src]="icon" alt="">
                        {{ name }}
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .primary-action{
            background-color: var(--bluewarmvivid-medlight);
            font-weight: bolder;
            color: white;
        }
        .secondary-action{
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }

        .padded { padding: 0.3em; }

        .major-left-right-margin {
            margin-left:  0.5em;
            margin-right: 0.5em;
        }

        .right-align {
            text-align: right;
            justify-content: flex-end;
        }


        .warning-background { background:#feec89; }

    `]
})
export class SaveFooterComponent implements OnInit,OnDestroy {

    private _dirty:boolean;


    @Input() actionType:ActionType = ActionType.PRIMARY;
    @Input() icon:string;
    @Input() message:string = "Your changes have not been saved";
    @Input() name:string = "Save";
    @Input() set dirty(data:any){
        if(data){
            this._dirty = data;
        }else{
            this._dirty = false;
        }

    }
    get dirty(){
        return this._dirty;
    }


    @Input() set showSpinner(showSpinner: boolean) {
        setTimeout( ()=>{
            if (showSpinner) {
                this.dialogsService.startDefaultSpinnerDialog();
            } else {
                this.dialogsService.stopAllSpinnerDialogs();
            }
        });

    }

    @Input() disableSave = false;
    @Output() saveClicked = new EventEmitter<any>();
    type = ActionType;

    constructor(private dialogsService: DialogsService) { }

    ngOnInit(){
        //console.log(this.disableSave);
    }
    notifySave():void{
        this.saveClicked.emit();
    }
    ngOnDestroy(){
        this.saveClicked.unsubscribe();
    }

}
