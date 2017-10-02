
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"


@Component({
    template: `
        <div> I am progress </div>
    `
})
export class ProgressBrowseTab extends PrimaryTab implements OnInit{
    name = "Progress";
    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    ngOnInit(){
    }

}
