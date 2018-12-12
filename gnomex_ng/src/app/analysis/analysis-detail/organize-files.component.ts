
import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output, Input} from "@angular/core";
import {Subscription} from "rxjs";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActivatedRoute} from "@angular/router";
import {GridOptions} from "ag-grid-community/main";
import {GnomexService} from "../../services/gnomex.service";
import {AnalysisService} from "../../services/analysis.service";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {HttpParams} from "@angular/common/http";
import {ConstantsService} from "../../services/constants.service";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {first} from "rxjs/operators";
import * as _ from "lodash";
import {Tree} from "@angular/router/src/utils/tree";
import {IDTypeDictionary, ITreeNode} from "angular-tree-component/dist/defs/api";
import {FormGroup} from "@angular/forms";
import {TabChangeEvent} from "../../util/tabs";



@Component({
    selector: "organize-file",
    templateUrl:"./organize-files.component.html",
    styles: [`

        mat-radio-group.filter {
            display: inline-flex;
            flex-direction: row;
            margin: 1em;
            padding-top: 1em;
        }
        mat-radio-button.filterOption{
            margin: 0 5px
        }

        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }

        .flex-row-container {
            display: flex;
            flex-direction: row;
        }

        .br-exp-item {
            flex: 1 1 auto;
            font-size: small;
        }



        .datatracks-panel {
            height:100%;
            width:100%;
            border: #C8C8C8 solid thin;
            padding: 1em;
        }
        .truncate{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }


    `]
})
export class OrganizeFilesComponent implements OnInit, AfterViewInit{
    private selectedTreeNodeSubscript: Subscription;
    public currentLab:any;
    public showSpinner:boolean = false;
    public labList:any[] = [];
    public analysis:any;
    public analysisTreeNode:any;
    public organizeOpts:ITreeOptions;
    public uploadOpts:ITreeOptions;
    public organizeFiles: any[];
    public uploadFiles:any[];
    public organizeSelectedNode:ITreeNode;
    public uploadSelectedNode:ITreeNode;
    public formGroup: FormGroup;
    private defaultOrgOpts: ITreeOptions;


    private _tabVisible: boolean = false;

    @Input() set tabVisible(val:boolean){
        this._tabVisible = val;
        if(this._tabVisible){
            setTimeout(()=>{
                this.organizeTree.treeModel.roots[0].expand();
            });
        }

    }
    get tabVisible():boolean{
        return this._tabVisible;
    }

    @ViewChild('organizeTree')
    private organizeTree: TreeComponent;
    @ViewChild('uploadTree')
    private uploadTree: TreeComponent;

    @Output() closeDialog = new EventEmitter<TabChangeEvent>();

    public readonly organizeHelp :string =  "Drag uploaded file into one of the folders on the right." +
        "Protected files (red) cannot be moved or deleted.";






    constructor(private analysisService:AnalysisService, private gnomexService: GnomexService,
                private orderValidateService: BrowseOrderValidateService,
                private secAdvisor: CreateSecurityAdvisorService,
                public constService:ConstantsService,
                private dialogService: DialogsService,
                private route:ActivatedRoute, private dictionaryService: DictionaryService ) {
    }

    ngOnInit(){

        // rowdata  changes based off of grid selected. default is illumnia or longest array size?


        this.labList = this.gnomexService.labList;
        this.uploadOpts = {
            displayField: 'displayName',
            allowDrag: (node: any) =>{return node.level === 1},
            allowDrop: (element, item: {parent: any, index}) => {
                return false;
            }

        };

        this.defaultOrgOpts = {
            displayField: 'displayName',
            childrenField: "FileDescriptor",
            useVirtualScroll: true,
            nodeHeight: 22,
            allowDrag: (node: any) =>{
                if(node.data.PROTECTED && node.data.PROTECTED === 'Y'){
                    return false;
                }
                return node.level > 1
            },
            allowDrop: (element, item: {parent: any, index}) => {
                return (item.parent.isRoot || item.parent.data.type === 'dir');
            }
        };

        this.organizeOpts = _.cloneDeep(this.defaultOrgOpts);

        this.organizeFiles = [
            {
                type: "dir",
                displayName: "is the root",
                FileDescriptor: [
                    {
                        type: "dir",
                        displayName: "The folder 1",
                        FileDescriptor : [
                            {
                                type: "file",
                                displayName: "file1a",
                            },
                            {
                                type: "file",
                                displayName: "file1b",
                            },
                            {
                                type: "dir",
                                displayName: " folder1 subFolder1",
                                FileDescriptor : [
                                    {
                                        type: "file",
                                        displayName: "Folder1 SubFolder1 file1a",
                                        PROTECTED: 'Y'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "dir",
                        displayName: "The folder 2",
                        FileDescriptor : [
                            {
                                type: "file",
                                displayName: "file2a"
                            },
                            {
                                type: "file",
                                displayName: "file2b"
                            }
                        ]
                    }
                ]
            }
        ];

        this.uploadFiles = [
            {displayName:'test1.txt'},{displayName:'test2.txt'},{displayName:'test3.txt'},{displayName:'test4.txt'},{displayName:'test5.txt'},{displayName:'test6.txt'},{displayName:'test7.txt'},{displayName:'test8.txt'},{displayName:'test9.txt'},{displayName:'test10.txt'},
            {displayName:'test11.txt'},{displayName:'test12.txt'},{displayName:'test13.txt'},{displayName:'test14.txt'},{displayName:'test15.txt'},{displayName:'test16.txt'},{displayName:'test17.txt'},{displayName:'test18.txt'},{displayNamebel:'test19.txt'},{displayName:'test20.txt'},{displayName:'test21.txt'}
        ];
        //this.uploadFiles = [{label:'test1.txt'},{label:'test2.txt'},{label:'test3.txt'},{label:'test4.txt'},{label:'test5.txt'},{label:'test6.txt'},{label:'test7.txt'},{label:'test8.txt'},{label:'test9.txt'},{label:'test10.txt'},{label:'test11.txt'},{label:'test12.txt'},{label:'test13.txt'},{label:'test14.txt'},{label:'test15.txt'},{label:'test16.txt'},{label:'test17.txt'},{label:'test18.txt'},{label:'test19.txt'},{label:'test20.txt'},{label:'test21.txt'}];
        //console.log("This is value: " + this.isProtected(this.organizeFiles) + "This is the expected value: true ");
        this.setFileProtected(this.organizeFiles[0]);

        this.buildTree(this.organizeFiles);
        //let something = this.gnomexService.getTargetNodeList( "FileDescriptor", this.organizeFiles);
        //console.log(something);



        this.selectedTreeNodeSubscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data =>{
                this.analysisTreeNode = data;
            });





    }

    ngAfterViewInit() {
    }

    onMove(event){
        let nodeEvent = <ITreeNode> event.node;
        let node = this.organizeTree.treeModel.getNodeById(nodeEvent.id);
        let parentNode = this.organizeTree.treeModel.getNodeById(event.to.parent.id);
        node.focus();
        parentNode.expand();
    }


    // tree methods
    isProtected(root:any, showMessage:boolean = false) : boolean{

        let action = false;
        if(root.type == 'dir' && root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The folder you are attempting to delete \'" + root.displayName
                    + "\' has protected files contained within it.");
                action = true;
            }
        }else if(root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The file you are attempting to delete \'"+ root.displayName
                    + "\' is protected ");

            }

            action = true;
        }


        return action;

    }

    recurseIsProtected(files:any[]) : boolean {
        let isProtected: boolean = false;
        if(files){
            for(let fObj of files ){
                let currentProtected = !!(fObj.PROTECTED  && fObj.PROTECTED === 'Y');
                isProtected = this.recurseIsProtected(fObj.FileDescriptor) || currentProtected;
                if(isProtected && fObj.type === 'dir'){
                    fObj.PROTECTED = 'Y';
                }
            }


        }

        return isProtected


    }

    public setFileProtected(file: any): boolean {
        if (file.PROTECTED) {
            return file.PROTECTED === 'Y';
        }

        let isProtected: boolean = false;
        if (file.FileDescriptor) {
            for (let child of file.FileDescriptor) {
                if (this.setFileProtected(child)) {
                    isProtected = true;
                }
            }
        }
        file.PROTECTED = isProtected ? 'Y' : 'N';
        return isProtected;
    }



    // tree methods
    buildTree(root:any){
        this.recurseBuildTree(root);
        this.showSpinner = false;

    }

    recurseBuildTree(files:any[]){
        if(files){
            for(let fObj of files ){

                if(fObj.type === 'dir'){
                    fObj.icon = this.constService.ICON_FOLDER;
                }else{
                    this.constService.getTreeIcon(fObj,"Request")
                }

                this.recurseBuildTree(fObj.FileDescriptor);
            }


        }


    }

    uploadTreeOnSelect(event:any){
        this.uploadSelectedNode = <ITreeNode>event.node;
    }
    uploadTreeOnUnselect(event:any){
        this.uploadSelectedNode = null;
    }

    organizeTreeOnSelect(event:any){
        this.organizeSelectedNode = <ITreeNode>event.node;

    }
    organizeTreeOnUnselect(event:any){
        this.organizeSelectedNode = null;
    }
    addNewFolder(){
        let targetNode = null;
        if(this.organizeSelectedNode){
            if(this.organizeSelectedNode.isLeaf && !(this.organizeSelectedNode.data.type === 'dir' )){
                targetNode = this.organizeSelectedNode.parent.data;
            }else{
                targetNode = this.organizeSelectedNode.data
            }

            let files:any[] = targetNode.FileDescriptor;
            if(files){
                files.push({
                    dirty: 'Y',
                    key: "X-X-New Folder",
                    displayName: "New-Folder",
                    type: "dir",
                    qualifiedFilePath: "",
                    isEmpty: 'Y',
                    PROTECTED: this.isProtected(targetNode) ? 'Y' : 'N',
                    info: ""

                });
                this.organizeTree.treeModel.update();
            }
        }

    }
    remove(){
        if(this.organizeSelectedNode){
            let id = this.organizeSelectedNode.id;
            let parentNode = this.organizeSelectedNode.parent;
            let children: any[] = <any[]>parentNode.data.FileDescriptor;

            if(!this.isProtected(this.organizeSelectedNode.data,true)){
                parentNode.data.FileDescriptor =  children.filter(c => c.id !== id);
                this.organizeTree.treeModel.update();
            }

        }
    }

    showHelp(){
        this.dialogService.alert(this.organizeHelp);
    }


    requestToCloseDialog(){
        this.closeDialog.emit();
    }





    ngOnDestroy():void{
        this.selectedTreeNodeSubscript.unsubscribe();
    }

}
