
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {Subscription} from "rxjs/Subscription";
import {GnomexStyledGridComponent} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {GridOptions} from "ag-grid/main";
import {URLSearchParams} from "@angular/http"
import {AnalysisService} from "../../services/analysis.service";
import {GnomexStringUtilService} from "../../services/gnomex-string-util.service";


@Component({

    template: `
        <div style="display:block; height:100%; width:100%;">

            <ag-grid-angular style="width: 100%; height: 90%;" class="ag-fresh"
                             [gridOptions]="gridOpt"
                             (cellDoubleClicked)="forwardToAnalysis($event)"
                             [rowData]="rowData"
                             [columnDefs]="columnDefs"
                             [rowSelection]="rowSelection"
                             (gridReady)="onGridReady($event)"
                             (cellEditingStarted)="startEditingCell($event)"
                             [enableSorting]="true"
                             [enableColResize]="true">
            </ag-grid-angular>

            <div class="flex-container">
                <span></span>
                <div>
                <span *ngIf="dirty" style="background:#feec89; padding: 1em 1em 1em 1em;">
                    Your changes have not been saved
                </span>
                    <span style="margin-left:1em; ">
                    <button  mat-button  color="primary" (click)="save()"> <img src="../../../assets/action_save.gif">Save</button>
                </span>

                </div>
            </div>
            
        </div>
        <!--<div> {{experimentService.experimentList[0] | json}} </div> -->

        
        
        
    `,
    styles: [`
       
        
        
        .flex-container{
           
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            padding-left: 1em;
        }
    `]
})
export class AnalysisVisibleTabComponent extends PrimaryTab implements OnInit{


    ngOnInit():void{

    }


}




