
import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";




@Component({
    selector:'dt-relate-data-tab',
    template: `        
        <div style="display:flex; height:100%;">
            <div matTooltip="Analyses and Experiments" *ngIf="aTreeNodes.length > 0" style="flex:1;border: 1px solid grey;">
                <tree-root  #aTree [nodes]="aTreeNodes" [options]="options" (activate)="onActivateAnalysisTree($event)">
                    <ng-template #treeNodeTemplate let-node >
                        <img src="{{node?.data?.icon}}" height="16" width="16">
                        <span>{{ node?.data?.label }}</span>
                    </ng-template>
                </tree-root>
            </div>

            <div matTooltip="Topics" *ngIf="tTreeNodes.length > 0"  style="flex:1;border: 1px solid grey;">
                
                <tree-root   #tTree [nodes]="tTreeNodes"  [options]="options" (activate)="onActivateTopicTree($event)" >
                    <ng-template #treeNodeTemplate  let-node >
                        <img src="{{node?.data?.icon}}" height="16" width="16">
                        <span>{{ node?.data?.label }}</span>
                    </ng-template>

                </tree-root>
            </div>



        </div>
        
        
        
   
`,
    styles: [`
        .half-width {  width: 50%;   }
        .full-width {  width: 100%;  }
    `]
})
export class DatatracksRelatedDataTabComponent implements OnInit, AfterViewInit{
    //Override

    private _relatedTopics:any;
    private _relatedObjects:any;
    private treeModel: TreeModel;
    public showSpinner:boolean = false;
    public aTreeNodes:ITreeNode[] = [];
    public tTreeNodes:ITreeNode[] = [];
    public options:ITreeOptions;
    @ViewChild('tTree') private tTreeComponent: TreeComponent;
    @ViewChild('aTree') private aTreeComponent: TreeComponent;


    // if both grids are showing:
    extraClass: string = 'half-width';


    @Input() set relatedTopics(val:any){
        this._relatedTopics = val;
        if(this._relatedTopics){
            this.buildTopicTree();
        }
    }
    @Input() set relatedObjects (val:any){
        this._relatedObjects = val;
        if(this._relatedObjects){
            this.buildAnalysisTree();
        }
    }






    constructor(private constService:ConstantsService ,private dtService: DataTrackService,
                private gnomexService:GnomexService){
    }



    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
        this.options = {
            displayField: 'label',
        };
        this.buildAnalysisTree();


    }

    ngAfterViewInit():void{


    }


    buildAnalysisTree(){
        let tempAnalyses:any[] = (<Array<any>>this._relatedObjects.Analysis).slice();
        for(let i= 0; i <   tempAnalyses.length; i++ ){
            this.constService.getTreeIcon(tempAnalyses[i],"Analysis");
            if(tempAnalyses[i].Request){ // request has icon on each node
                tempAnalyses[i].children = Array.isArray(tempAnalyses[i].Request)? tempAnalyses[i].Request : [tempAnalyses[i].Request];
            }
        }
        this.aTreeNodes = tempAnalyses;

    }
    buildTopicTree(){
        let tempTopics:any[] = (<Array<any>>this._relatedTopics.Topic).slice();
        for(let i= 0; i <   tempTopics.length; i++ ){
            this.constService.getTreeIcon(tempTopics[i],"Topic");
            let childrenList:Array<Array<any>> = [];

            Object.keys(tempTopics[i]).forEach((key) =>{
                if(key === "Request" || key === "Analysis" || key === "DataTrack" || key === "Topic" ){
                    let tempTopic = tempTopics[i];
                    let order = Array.isArray(tempTopic[key])? tempTopic[key] : [tempTopic[key]];
                    for(let o of order){
                        this.constService.getTreeIcon(o,key);
                    }
                    childrenList.push(order);
                }
            });
            let children = [].concat.apply([], childrenList);
            tempTopics[i].children = children;


        }
        this.tTreeNodes = tempTopics;
    }


    private navToItem(item:any){
        let number = item.number;
        if(number){
            this.gnomexService.navByNumber(number);
        }else if(item.idTopic){
            this.gnomexService.navByNumber("T"+item.idTopic);
        }



    }

    onActivateAnalysisTree($event){
        let selectedItem = $event.node;
        let itemData = selectedItem.data;
        this.navToItem(itemData)


    }
    onActivateTopicTree($event){
        let selectedItem = $event.node;
        let itemData = selectedItem.data;
        this.navToItem(itemData);
    }



}




