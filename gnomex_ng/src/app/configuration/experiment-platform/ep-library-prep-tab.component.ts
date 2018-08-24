import {Component, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
//assets/page_add.png

@Component({
    template: `
        <div> Library Prep HOlder</div>
    `,
    styles:[`        
    `]
})

export class EpLibraryPrepTabComponent implements OnInit{
    public formGroup:FormGroup;

    constructor(private fb:FormBuilder){
    }

    ngOnInit(){
        this.formGroup = this.fb.group({});
    }


}
