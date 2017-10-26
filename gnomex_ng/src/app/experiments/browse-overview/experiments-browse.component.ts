import {Component, OnInit} from "@angular/core";
import {PrimaryTab} from "../../util/tabs/primary-tab.component";
import {FormBuilder} from "@angular/forms";
import {ExperimentsService} from "../experiments.service";

@Component({
    template: `
        <div> I am experiments </div>
    `
})
export class ExperimentsBrowseTab extends PrimaryTab implements OnInit{
    name:string = "Experiments";

    constructor(protected fb: FormBuilder, private experimentService:ExperimentsService) {
        super(fb);
    }

    ngOnInit(){
    }

}