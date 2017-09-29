/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentViewService} from "../../services/experiment-view.service";


@Component({
    template: `
        <div> I am downloads </div>
    `
})
export class DownloadsBrowseTab extends PrimaryTab implements OnInit{
    name="Downloads"
    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    ngOnInit(){
    }

}
