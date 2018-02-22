import {Component, Input, OnInit} from '@angular/core';
import {URLSearchParams} from "@angular/http";

@Component({
    selector: 'save-footer',
    template: `
        <div style="text-align: right" >
            <div style="display:inline-block; margin-bottom: 1em">
                <div style="display:inline-block;">
                    <mat-spinner *ngIf="this.showSpinner" strokeWidth="3" [diameter]="30"></mat-spinner>
                </div>
               <div *ngIf="this.dirty" style="display:inline-block; background:#feec89; padding: 1em 1em 1em 1em;">
                    {{this.message}}
                </div>
               <div style="display:inline-block; margin-left: 1em;">
                    <button [disabled]="disableSave"  type="submit" mat-button  color="primary" >
                        <img src="../../../assets/action_save.gif">Save
                    </button>
                </div>
            </div>
        </div>
           
    `

})

export class SaveFooterComponent implements OnInit {

    @Input() message:string = "Your changes have not been saved";
    @Input() dirty:boolean = false;
    @Input() showSpinner = false;
    @Input() disableSave = false;

    ngOnInit(){
        console.log(this.showSpinner);
        console.log(this.dirty);
        console.log(this.message);
        //console.log(this.disableSave);

    }

}
