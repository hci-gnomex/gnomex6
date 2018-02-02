import { Component,ComponentRef, Input, ContentChild, AfterContentInit, } from '@angular/core';
import {PrimaryTab} from './primary-tab.component'
// Probably in real app would move to a shared folder visible in app.module
@Component({
    selector: 'tab',
    styles: [`        
        .pane {
            padding-left: 1em;
            height: calc(100% - 4em);
            overflow:auto;
        }
        ::content >>> tab {background-color:grey}
  `],
    template: `

        <div [hidden]="!active" class="pane">
            <ng-content></ng-content>
        </div>
        

    `
})
export class Tab {
    @Input('tabTitle') title: string;
    @Input() active:boolean = false;// the current tab all else are hidden
    @Input() enable:boolean = true; // allowed tab to navigate to.
    @Input() valid:boolean = true; // form isn't valid  on tab
    private theComponent:ComponentRef<PrimaryTab>;

    initComp(compRef:ComponentRef<PrimaryTab>):void{
        this.theComponent = compRef;
    }
    getComp():PrimaryTab{
        return this.theComponent.instance;
    }


}