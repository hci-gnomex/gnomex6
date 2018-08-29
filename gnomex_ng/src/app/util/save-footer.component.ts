import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {DialogsService} from "./popup/dialogs.service";

@Component({
    selector: 'save-footer',
    template: `
        <div class="full-height full-width">
            <div class="flex-container-row right-align padded">
                <div *ngIf="this.dirty" class="warning-background padded">
                    {{this.message}}
                </div>
                <div class="major-left-right-margin">
                    <button [disabled]="disableSave"  type="submit" mat-button  color="primary" (click)="notifySave()">
                        <img src="../../../assets/action_save.gif">
                        {{actionType}}
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        
        .padded { padding: 0.3em; }
        
        .major-left-right-margin {
            margin-left:  1em;
            margin-right: 1em;
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

    @Input() message:string = "Your changes have not been saved";
    @Input() actionType:string = "Save";
    @Input() set dirty(data:boolean){
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
