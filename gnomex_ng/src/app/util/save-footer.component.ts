import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DialogsService} from "./popup/dialogs.service";
import {ActionType} from "./interfaces/generic-dialog-action.model";

@Component({
    selector: 'save-footer',
    template: `
        <div class="full-height full-width" role="region" aria-label="Save footer">
            <div class="flex-container-row align-center right-align padded">
                <div *ngIf="dirty" class="warning-background padded" role="alert" aria-live="polite">
                    {{ message }}
                </div>
                <div class="major-left-right-margin">
                    <button mat-raised-button [disabled]="disableSave"
                            [color]="actionType" (click)="notifySave()"
                            [ngClass]="{'primary-action': actionType === type.PRIMARY,
                                        'secondary-action': actionType === type.SECONDARY && !disableSave }"
                            [attr.aria-label]="name">
                        <img *ngIf="icon" [src]="icon" alt="" aria-hidden="true">
                        {{ name }}
                    </button>
                </div>
            </div>
        </div>
    `,
    styleUrls: ["./save-footer.component.scss"]
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
