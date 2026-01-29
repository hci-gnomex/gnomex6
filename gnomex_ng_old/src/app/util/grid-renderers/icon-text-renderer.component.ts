
import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {MatSelect,MatSelectChange} from '@angular/material/select';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {DictionaryService} from "../../services/dictionary.service";


@Component({

    template: `
        <div class="full-width full-height">
            <div class="t full-width full-height fix-table">
                <div class="tr">
                    <div class="td vertical-align ellipsis">
                        <img [src]="iconSource" alt=""/> {{text}}
                    </div>
                </div>
            </div>
        </div>
    
    `,
    styles: [`
        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }
        
        .vertical-align { vertical-align: middle; }
        
        .fix-table { table-layout:fixed; }
        
        .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `]
})
export class IconTextRendererComponent implements ICellRendererAngularComp, AfterViewInit, OnInit {

    private params;
    private text = "";
    private iconSource = "";


    constructor(private dictionaryService:DictionaryService){
    }
    ngOnInit(){
    }


    ngAfterViewInit():void{
        /*setTimeout(() => {
            this.container.element.nativeElement.focus();
        })*/
    }

    agInit(params: any): void {
        this.params = params;
        this.setIconWithText(params);
    }

    refresh(params: any): boolean {
        this.params = params;
        this.setIconWithText(params);
        return true;
    }

    private setIconWithText(params) {
        this.text = params.value ? params.value: '';
        this.iconSource = params.data.icon? params.data.icon : '';
    };



}
