import {AfterViewInit, Component, Input, OnInit} from "@angular/core";
import {ITreeOptions, TreeModel} from "@circlon/angular-tree-component";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {IRelatedObject} from "./interfaces/related-objects.model";
import {DialogsService, DialogType} from "./popup/dialogs.service";


@Component({
    selector:'related-data-tab',
    template: `
        <div style="display:flex; height:100%;" role="region" aria-label="Related data">
            <ng-container *ngFor="let key of relatedKeys">
                <div class="flex-item-tree" [matTooltip]="this.treeNameLookup[key]" *ngIf="this.relatedObjects[key]?.length > 0"
                     role="region" [attr.aria-label]="treeNameLookup[key] + ' tree'">
                    <tree-root appAccessibleTree
                               [nodes]="this.relatedObjects[key]"
                               [options]="options"
                               (activate)="onActivateTree($event)"
                               [accessibleTreeIdPrefix]="'related-data-' + key"
                               [attr.aria-label]="treeNameLookup[key]">
                        <ng-template #treeNodeTemplate let-node >
                            <div appAccessibleTreeNode
                                 [treeNode]="node"
                                 [accessibleTreeNodeIdPrefix]="'related-data-' + key"
                                 [accessibleTreeNodeLabel]="node?.data?.label"
                                 class="tree-node-font">
                                <img src="{{node?.data?.icon}}" class="tree-node-icon icon" alt="" aria-hidden="true">
                                <span>{{ node?.data?.label }}</span>
                            </div>
                        </ng-template>
                    </tree-root>
                </div>
            </ng-container>


        </div>




    `,
    styleUrls: ["./related-data-tab.component.scss"]
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
                private gnomexService:GnomexService,
                private dialogsService: DialogsService,){
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
        if ((itemData.label as string).endsWith("(Not authorized)")) {
            this.dialogsService.alert("You do not have permission to view this", "Permission", DialogType.FAILED);
            return;
        }
        this.navToItem(itemData);
    }

}




