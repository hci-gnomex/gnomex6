
import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {MatSelect,MatSelectChange} from '@angular/material/select';
import {ICellEditorAngularComp} from "ag-grid-angular";
import {DictionaryService} from "../../services/dictionary.service";


@Component({

    templateUrl: './select-editor.component.html',
    styles: [`
        
    `]
})
export class SelectEditorComponent implements ICellEditorAngularComp, AfterViewInit, OnInit {

    private params;
    selectedNode:string = "MEM";
    options:Array<any> = [];

    constructor(private dictionaryService:DictionaryService){
    }
    ngOnInit(){
       this.options = this.dictionaryService.getEntries(DictionaryService.VISIBILTY);
    }


    agInit(params:any ): void {
        this. params = params;

    }
    ngAfterViewInit():void{
        /*setTimeout(() => {
            this.container.element.nativeElement.focus();
        })*/
    }

    isPopup():boolean{
        return false;
    }
    getValue():any {
        return this.selectedNode;
    }

    selectionChange(event:MatSelectChange){
    }


}
