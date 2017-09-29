import {Component, OnInit} from "@angular/core";
import {PrimaryTab} from "../../util/tabs/primary-tab.component";
import {FormBuilder} from "@angular/forms";

@Component({
    template: `
        <div> I am experiments </div>
    `
})
export class ExperimentsBrowseTab extends PrimaryTab implements OnInit{
    name ="Experiments";
    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    ngOnInit(){
    }

}