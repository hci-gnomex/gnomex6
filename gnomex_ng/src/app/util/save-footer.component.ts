import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {URLSearchParams} from "@angular/http";

@Component({
    selector: 'save-footer',
    template: `
        <div style="display:flex;justify-content:flex-end; margin-top:1em; " >

            <div *ngIf="this.showSpinner" >
                <mat-spinner  strokeWidth="3" [diameter]="30"></mat-spinner>
            </div>
            <div *ngIf="this.dirty" style="background:#feec89; padding: 1em 1em 1em 1em;">
                {{this.message}}
            </div>
            <div style="margin-left: 1em; margin-right: 1em;">
                <button [disabled]="disableSave"  type="submit" mat-button  color="primary" (click)="notifySave()">
                    <img src="../../../assets/action_save.gif">Save
                </button>
            </div>

        </div>
           
    `

})

export class SaveFooterComponent implements OnInit,OnDestroy {


    private _dirty:boolean;

    @Input() message:string = "Your changes have not been saved";
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


    @Input() showSpinner = false;
    @Input() disableSave = false;
    @Output() saveClicked = new EventEmitter<any>();

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
