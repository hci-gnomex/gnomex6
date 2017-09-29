
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"


@Component({
    template: `
        <div> I am project </div>
    `
})
export class ProjectBrowseTab extends PrimaryTab implements OnInit{
    name="Project";

    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    ngOnInit(){
    }

}
