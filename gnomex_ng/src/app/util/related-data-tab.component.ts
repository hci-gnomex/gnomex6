
import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {DataTrackService} from "../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {IRelatedObject} from "./interfaces/related-objects.model";




@Component({
    selector:'related-data-tab',
    template: `
        <div style="display:flex; height:100%;">
            <ng-container *ngFor="let key of relatedKeys">
                <div class="flex-item-tree" [matTooltip]="this.treeNameLookup[key]" *ngIf="this.relatedObjects[key]?.length > 0">
                    <tree-root [nodes]="this.relatedObjects[key]" [options]="options" (activate)="onActivateTree($event)">
                        <ng-template #treeNodeTemplate let-node >
                            <img src="{{node?.data?.icon}}" height="16" width="16">
                            <span>{{ node?.data?.label }}</span>
                        </ng-template>
                    </tree-root>
                </div>
            </ng-container>


        </div>




    `,
    styles: [`        
        .flex-item-tree { 
            flex:1;
            border:thin solid gainsboro; 
        }
    `]
})
export class RelatedDataTabComponent implements OnInit, AfterViewInit{

    private _relatedObjects:IRelatedObject;
    private treeModel: TreeModel;
    public showSpinner:boolean = false;
    public options:ITreeOptions;
    public relatedKeys:string[];
    public treeNameLookup: any;


    @Input() set relatedObjects (val:IRelatedObject){
        this._relatedObjects = val;
        if(this._relatedObjects){
            Object.keys(this._relatedObjects).forEach(key =>{
                this.buildTree(this._relatedObjects[key], key);
            });

        }
    }
    get relatedObjects():IRelatedObject{
        return this._relatedObjects;
    }




    constructor(private constService:ConstantsService,
                private gnomexService:GnomexService){
    }


    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
        this.options = {
            displayField: 'label',
        };
        this.relatedKeys = Object.keys(this._relatedObjects);
        this.treeNameLookup = {
            Analysis: "Analysis",
            DataTrack: "Data Track",
            Request: "Experiment",
            Topic: "Topic"
        }


    }

    ngAfterViewInit():void{

    }


    buildTree(orderList:any[],pkey:string){
        let tempOrderList = orderList.slice();
        for(let i= 0; i <   tempOrderList.length; i++ ){
            this.constService.getTreeIcon(tempOrderList[i],pkey);
            let childrenList:Array<Array<any>> = [];

            Object.keys(tempOrderList[i]).forEach((key) =>{
                if(key === "Request" || key === "Analysis" || key === "DataTrack" || key === "Topic" || key === "SequenceLane" ){
                    let tempOrder = tempOrderList[i];
                    let order = Array.isArray(tempOrder[key])? tempOrder[key] : [tempOrder[key]];
                    for(let o of order){
                        this.constService.getTreeIcon(o,key);
                    }
                    childrenList.push(order);
                }
            });
            let children = [].concat.apply([], childrenList);
            tempOrderList[i].children = children;
        }
        this.relatedObjects[pkey] = tempOrderList;

    }





    private navToItem(item:any){
        let number = item.number;
        if(number){
            this.gnomexService.navByNumber(number);
        }else if(item.idTopic){
            this.gnomexService.navByNumber("T"+item.idTopic);
        }



    }

    onActivateTree($event){
        let selectedItem = $event.node;
        let itemData = selectedItem.data;
        this.navToItem(itemData)


    }



}




