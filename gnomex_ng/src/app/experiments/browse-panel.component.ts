/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component,OnInit} from "@angular/core";



@Component({
    selector: 'browse-panel',
    template: `        
        <div style="height: calc(100% - 6em);">
            <router-outlet name="browsePanel"></router-outlet>
        </div>
`
})
export class BrowsePanelComponent implements OnInit{

    constructor(){
    }

    ngOnInit(){

    }
    save(){

    }
}
