
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"


@Component({

    template: `
        <div> I am visiblity </div>
    `
})
export class VisiblityBrowseTab extends PrimaryTab implements OnInit{
    name="Visibility";
    constructor(protected fb: FormBuilder) {
        super(fb);
    }

    ngOnInit(){
    }

}
