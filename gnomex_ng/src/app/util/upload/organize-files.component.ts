import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import {Subscription} from "rxjs";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {AnalysisService} from "../../services/analysis.service";
import {IActionMapping, ITreeOptions, TREE_ACTIONS, TreeComponent} from "angular-tree-component";
import {ConstantsService} from "../../services/constants.service";
import {first} from "rxjs/operators";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TabChangeEvent} from "../tabs/index";
import {MatDialogConfig} from "@angular/material";
import {NameFileDialogComponent} from "./name-file-dialog.component";
import {FileService} from "../../services/file.service";
import {IFileParams} from "../interfaces/file-params.model";
import {ActionType} from "../interfaces/generic-dialog-action.model";

const actionMapping: IActionMapping = {
    mouse: {
        click: (tree, node, $event) => {
            $event.ctrlKey
                ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
                : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event)
        }
    }
};

@Component({
    selector: "organize-file",
    templateUrl: "./organize-files.component.html",
    styles: [`
        .no-padding-dialog {
            padding: 0;
        }
        .truncate{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .no-overflow  { overflow: hidden; }

        .secondary-action {
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }
    `]
})
export class OrganizeFilesComponent implements OnInit, AfterViewInit{
    private manageFileSubscript: Subscription;
    public currentLab:any;
    public showSpinner:boolean = false;
    public labList:any[] = [];
    public analysis:any;
    public organizeOpts:ITreeOptions;
    public uploadOpts:ITreeOptions;
    public organizeFiles: any[];
    public uploadFiles:any[];
    public organizeSelectedNode:ITreeNode;
    public uploadSelectedNode:ITreeNode;
    public formGroup: FormGroup;
    public removedChildren: Set<string> = new Set();
    public splitOrgSize:number;
    public showFileTrees: boolean =  false;
    public disableRemove:boolean = true;
    public disableRename:boolean = true;
    public actionType: any = ActionType.SECONDARY ;

    @ViewChild('organizeTree')
    private organizeTree: TreeComponent;
    @ViewChild('uploadTree')
    private uploadTree: TreeComponent;

    @Output() closeDialog = new EventEmitter<TabChangeEvent>();
    @Input('manageData') data: IFileParams;

    public readonly organizeHelp :string =  "Drag uploaded file into one of the folders on the right." +
        "Protected files (red) cannot be moved or deleted.";


    constructor(private analysisService:AnalysisService,
                private gnomexService: GnomexService,
                public secAdvisor: CreateSecurityAdvisorService,
                private fb:FormBuilder,
                private fileService: FileService,
                public constService:ConstantsService,
                private changeDetector: ChangeDetectorRef,
                private dialogService: DialogsService) {
    }

    ngOnInit(){
        this.splitOrgSize = 0;
        this.formGroup = this.fb.group({
            organizeFileParams: {}
        });
        this.fileService.addManageFilesForm("OrganizeFilesComponent", this.formGroup);

        this.uploadOpts = {
            displayField: 'displayName',
            idField:'idTreeNode',
            allowDrag: (node: any) =>{return node.level === 1 && node.data.PROTECTED === 'N'},
            allowDrop: (element, item: {parent: any, index}) => {
                return false;
            },
            actionMapping
        };

        this.organizeOpts = {
            displayField: 'displayName',
            childrenField: "FileDescriptor",
            useVirtualScroll: true,
            idField:'idTreeNode',
            nodeHeight: 22,
            allowDrag: (node: any) =>{
                if(node.data.PROTECTED && node.data.PROTECTED === 'Y'){
                    return false;
                }
                return node.level > 1
            },
            allowDrop: (element, item: {parent: any, index}) => {
                let parent = <ITreeNode>item.parent;
                if((this.organizeTree.treeModel.roots[0].id === parent.id) || parent.data.type === 'dir' ) {
                    return true;
                }else{
                    return false;
                }

            },
            actionMapping
        };


        if(this.data.type === 'a'){

            this.manageFileSubscript = this.fileService.getAnalysisOrganizeFilesObservable().subscribe( (resp) => {
                this.disableRename = true;
                this.disableRemove = true;
                this.dialogService.stopAllSpinnerDialogs();
                if(resp && Array.isArray(resp)){
                    let respList = (<any[]>resp);
                    respList.map(r =>{
                        if(r && !r.message){
                            return r;
                        }else if(r && r.message ){
                            return r.message;
                        }
                    });


                    if( (typeof(respList[0]) !== 'string'  && typeof(respList[1]) !== 'string')){
                        let analysis = respList[0].Analysis;
                        let analysisDownloadList = respList[1].Analysis;

                        if(analysis && analysisDownloadList){
                            this.uploadFiles = this.getAnalysisUploadFiles(analysis.ExpandedAnalysisFileList.AnalysisUpload);
                            this.organizeFiles = [analysisDownloadList];
                            this.fileService.emitUpdateFileTab(this.organizeFiles);
                        }
                    }else{
                        //this.dialogService.alert()
                    }

                }
            });
            this.fileService.emitGetAnalysisOrganizeFiles({idAnalysis :this.data.id.idAnalysis});

        }else{

            this.manageFileSubscript = this.fileService.getRequestOrganizeFilesObservable().subscribe(resp =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.disableRename = true;
                this.disableRemove = true;
                this.uploadFiles = resp[0];
                this.organizeFiles = resp[1];
                this.fileService.emitUpdateFileTab(this.organizeFiles);


            },error =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.error(error);
            });
            this.fileService.emitGetRequestOrganizeFiles( {idRequest: this.data.id.idRequest});


        }


        this.labList = this.gnomexService.labList;



    }

    ngAfterViewInit() {
    }

    initOrganizeTree(event){
        event.treeModel.expandAll();
    }

    prepareView(showFileTree) {
        this.splitOrgSize = 30;
        this.showFileTrees = showFileTree;
    }


    getAnalysisUploadFiles(analysisUpload:any):any[]{
        if(analysisUpload && analysisUpload.FileDescriptor){
            return Array.isArray(analysisUpload.FileDescriptor) ? analysisUpload.FileDescriptor : [analysisUpload.FileDescriptor];
        }
        return [];
    }

    onMove(event){
        let nodeEvent = event.node;
        let node = this.organizeTree.treeModel.getNodeById(nodeEvent.idTreeNode);
        let parentNode = this.organizeTree.treeModel.getNodeById(event.to.parent.idTreeNode);
        node.data.dirty = 'Y';
        node.focus();
        parentNode.expand();
        this.formGroup.markAsDirty();
    }

    // tree methods
    isProtected(root:any, showMessage:boolean = false) : boolean{
        let action = false;
        if(root.type == 'dir' && root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The folder you are attempting to delete \'" + root.displayName
                    + "\' has protected files contained within it.", null, DialogType.WARNING);
                action = true;
            }
        }else if(root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The file you are attempting to delete \'"+ root.displayName
                    + "\' is protected ", null, DialogType.WARNING);

            }
            action = true;
        }

        return action;

    }


    public getChildrenToRemove(file: any): boolean {
        if (file.PROTECTED && file.type !== "dir") {

            let p = file.PROTECTED === 'Y';
            if(!p){
                this.removedChildren.add(file)
            }
            return p;
        }

        let isProtected: boolean = false;
        if (file.FileDescriptor) {
            for (let child of file.FileDescriptor) {
                if (this.getChildrenToRemove(child)) {
                    isProtected = true;
                }
            }
        }

        if(file.PROTECTED || file.PROTECTED === 'N') {
            this.removedChildren.add(file);
        }
        return isProtected;
    }


    uploadTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.organizeTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }

        this.uploadSelectedNode = <ITreeNode>event.node;
        this.disableRemove = false;
    }
    uploadTreeOnUnselect(event:any){
        this.uploadSelectedNode = null;
        this.disableRemove = !this.organizeSelectedNode ? true : false;
    }

    organizeTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.uploadTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }
        this.organizeSelectedNode = <ITreeNode>event.node;
        let isRoot = this.organizeSelectedNode.isRoot;
        this.disableRename = isRoot;
        this.disableRemove = isRoot;


    }
    organizeTreeOnUnselect(event:any){
        this.organizeSelectedNode = null;
        this.disableRemove = !this.uploadSelectedNode ? true : false;
        this.disableRename = true;
    }

    private renameCallBack = (data) => {
        if(data){
            this.organizeSelectedNode.data.displayName = data;
            this.organizeSelectedNode.data.dirty = 'Y';
            this.organizeTree.treeModel.update();
            this.formGroup.markAsDirty()
        }
    };

    datatrackSelectedFile(nodes:ITreeNode[]):boolean{
        let hasDataTrack:boolean = false;
        for(let n of nodes){
            if(n.data.hasDataTrack === 'Y'){
                hasDataTrack = true;
            }
        }
        return hasDataTrack;
    }


    addNewFolder(){
        let targetNode = null;
        if(this.organizeSelectedNode){ // selected file
            if(this.organizeSelectedNode.isLeaf && !(this.organizeSelectedNode.data.type === 'dir' )){
                targetNode = this.organizeSelectedNode.parent.data;
            }else{ // selected folder
                targetNode = this.organizeSelectedNode.data;
                this.organizeSelectedNode.expand();
            }

            this.openRenameDialog("Add Folder", "Folder Name",(data) =>{
                if(data){
                    let displayName = data;
                    let files:any[] = targetNode.FileDescriptor;
                    if(files){
                        files.push({
                            isNew: 'Y',
                            dirty: 'Y',
                            key: "X-X-"+displayName,
                            displayName: displayName,
                            type: "dir",
                            qualifiedFilePath: "",
                            isEmpty: 'Y',
                            icon: this.constService.ICON_FOLDER_DISABLE,
                            PROTECTED: this.isProtected(targetNode) ? 'Y' : 'N',
                            info: ""

                        });
                        this.organizeTree.treeModel.update();
                        this.organizeSelectedNode =  this.organizeTree.treeModel.getActiveNodes()[0];
                        this.formGroup.markAsDirty();
                    }
                }
            }, this.constService.ICON_FOLDER_ADD);
        }
    }

    remove(treeRemovedFrom:string, nodes:ITreeNode[]){
        for(let node of nodes){
            if(treeRemovedFrom === 'organize' && node.isRoot ){
                continue;
            }

            let id:any = '';
            let parentNode: ITreeNode = node.parent;
            //let tree:TreeComponent = null;
            let children: any[] = [];

            if(treeRemovedFrom === 'organize'){
                id = node.id;
                //tree = this.organizeTree;
                children = <any[]>parentNode.data.FileDescriptor;
            }else {
                id = node.id;
                //tree = this.uploadTree;
                children = <any[]>parentNode.data.children
            }


            if(!this.isProtected(node.data,true)){
                this.getChildrenToRemove(node.data);

                if(treeRemovedFrom === 'organize'){
                    parentNode.data.FileDescriptor =  children.filter(c => c.idTreeNode !== id);
                }else{
                    let idx:number = -1;
                    for(let i = 0; i < children.length; i++){
                        if(children[i].idTreeNode === id){
                            idx = i;
                            break;
                        }
                    }
                    if(idx > -1){
                        children.splice(idx, 1);
                    }
                    //this.uploadFiles = children.filter(c => c.idTreeNode !== id);
                }
                //tree.treeModel.update();
                this.formGroup.markAsDirty();
            }
        }
        if(treeRemovedFrom === 'organize'){
            this.organizeTree.treeModel.update();
        }else{
            this.uploadTree.treeModel.update();
        }
        this.uploadSelectedNode = null;
        this.organizeSelectedNode = null;
    }

    attemptRemove(){
        let treeRemovedFrom:string = '';
        let nodes:ITreeNode[] = null;


        if(this.organizeSelectedNode){
            treeRemovedFrom = 'organize';
            nodes = this.organizeTree.treeModel.getActiveNodes();
        }else if(this.uploadSelectedNode){
            treeRemovedFrom = 'upload';
            nodes = this.uploadTree.treeModel.getActiveNodes();
        }else{
            return;
        }



        if(this.datatrackSelectedFile(nodes)){
            this.dialogService.confirm("At least one selected file is linked to a data track.  Do you want to remove the files and delete any associated data tracks?", "Warning")
                .pipe(first()).subscribe(answer =>{
                if(answer) {
                    this.remove(treeRemovedFrom, nodes);
                }
            });
        }else{
            this.remove(treeRemovedFrom, nodes);
        }

    }

    openRenameDialog(title: string, placeHolder: string, onClose, imgIcon?: string) {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            placeHolder: placeHolder
        };
        config.minWidth = "35em";

        this.dialogService.genericDialogContainer(NameFileDialogComponent, title, imgIcon ? imgIcon : null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "OK", internalAction: "applyChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe(onClose);

    }


    rename(){
        if(this.organizeSelectedNode){
            let p = this.organizeSelectedNode.data.PROTECTED;
            if( p && p === 'Y'){
                this.dialogService.alert("Protected files cannot be renamed.", null, DialogType.WARNING);
                return;
            }

            let title ="Rename " + this.organizeSelectedNode.data.displayName;
            this.openRenameDialog(title,'To', this.renameCallBack);
        }

    }
    refresh(){
        if(this.data.type === 'a'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetAnalysisOrganizeFiles(this.data.id.idAnalysis);
        }else if(this.data.type === 'e'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetRequestOrganizeFiles( {idRequest: this.data.id.idRequest});
        }
        this.formGroup.markAsPristine();

    }

    requestToCloseDialog(){
        this.closeDialog.emit();
    }

    expandFolders(){
        if(this.organizeSelectedNode){
            this.organizeSelectedNode.expandAll();
        }else{
            this.organizeTree.treeModel.expandAll();
        }
    }
    collapseFolders(){
        if(this.organizeSelectedNode){
            this.organizeSelectedNode.collapseAll();
        }else{
            this.organizeTree.treeModel.collapseAll();
        }
    }




    private requestSave():void{
        this.fileService.emitSaveManageFiles();
    }

    private makeParams(paramName,paramValue):any{
        let params = null;
        let removedChildrenList:any[] = this.removedChildren.size > 0  ? Array.from(this.removedChildren) : [];
        let childJsonStr = JSON.stringify(removedChildrenList);
        params = {
            "filesToRemoveJSONString": childJsonStr,
            "filesJSONString": JSON.stringify(this.organizeFiles[0]),
            "noJSONToXMLConversionNeeded": "Y"
        };
        params[paramName] = paramValue;
        return params

    }

    save(){
        let params:any = null;
        if(this.data.type === 'a'){
            params = this.makeParams( "idAnalysis",  this.data.id.idAnalysis);
        }else{
            params = this.makeParams( "idRequest", this.data.id.idRequest);
        }
        this.formGroup.get("organizeFileParams").setValue(params);
        this.removedChildren.clear();
    }

    ngOnDestroy():void{
        this.manageFileSubscript.unsubscribe();
    }
}
