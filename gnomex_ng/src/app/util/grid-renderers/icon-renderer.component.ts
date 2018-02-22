
import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {MatSelect,MatSelectChange} from '@angular/material/select';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {DictionaryService} from "../../services/dictionary.service";


@Component({

    template: `
        <div >
            <img [src]="iconSource" alt=""/>
        </div>
    
    `,
    styles: [`
        
    `]
})
export class IconRendererComponent implements ICellRendererAngularComp, OnInit {

    private params;
    private text = "";
    public iconSource = "";


    constructor(private dictionaryService:DictionaryService){
    }
    ngOnInit(){
    }


    agInit(params: any): void {
        this.params = params;
        this.setIcon(params);
    }

    refresh(params: any): boolean {
        this.params = params;
        this.setIcon(params);
        return true;
    }

    private setIcon(params) {
        this.iconSource =  params.value ? params.value: '';
    };



}
