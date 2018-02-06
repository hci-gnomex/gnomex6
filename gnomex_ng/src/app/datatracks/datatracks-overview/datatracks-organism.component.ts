
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"



@Component({

    template: `
        <div style="display:block; height:100%; width:100%;">
            experiment detail
        </div>
        
        
    `
})
export class DatatracksOrganismComponent extends PrimaryTab implements OnInit{
    //Override
    ngOnInit():void{
    }


}




