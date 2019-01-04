
import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output, Input} from "@angular/core";
import {Subscription} from "rxjs";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {AnalysisService} from "../../services/analysis.service";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {HttpParams} from "@angular/common/http";
import {ConstantsService} from "../../services/constants.service";
import {first} from "rxjs/operators";
import { ITreeNode} from "angular-tree-component/dist/defs/api";
import {FormGroup} from "@angular/forms";
import {TabChangeEvent} from "../tabs/index";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {NameFileDialogComponent} from "./name-file-dialog.component";
import {FileService} from "../../services/file.service";
import {IFileParams} from "../interfaces/file-params.model";



@Component({
    selector: "organize-file",
    templateUrl:"./organize-files.component.html",
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
    public removedChildren:any[] = [];
    public orgAnalysisFileParams:any;
    public orgExperimentFileParams:any;


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
    @Input('manageData') data: IFileParams;

    public readonly organizeHelp :string =  "Drag uploaded file into one of the folders on the right." +
        "Protected files (red) cannot be moved or deleted.";


    constructor(private analysisService:AnalysisService,
                private gnomexService: GnomexService,
                private secAdvisor: CreateSecurityAdvisorService,
                private fileService: FileService,
                public constService:ConstantsService,
                private dialogService: DialogsService,
                private dialog:MatDialog) {
    }

    ngOnInit(){
        this.uploadOpts = {
            displayField: 'displayName',
            idField:'idTreeNode',
            allowDrag: (node: any) =>{return node.level === 1 && node.data.PROTECTED === 'N'},
            allowDrop: (element, item: {parent: any, index}) => {
                return false;
            }

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

            }
        };




        this.formGroup = new FormGroup({});
        if(this.data.type === 'a'){
            this.orgAnalysisFileParams = {
                idAnalysis:this.data.id.idAnalysis,
                showUploads:'Y',
                includeUploadStagingDir:'N',
                skipUploadStagingDirFiles: 'Y'
            };

            this.manageFileSubscript = this.fileService.getAnalysisOrganizeFilesObservable().subscribe( (resp) => {
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
                        }
                    }else{
                        //this.dialogService.alert()
                    }

                }
            });
            this.fileService.emitGetAnalysisOrganizeFiles(this.orgAnalysisFileParams);

        }else{
            this.orgExperimentFileParams = {
                idRequest: this.data.id.idRequest,
                includeUploadStagingDir: 'N',
                showUploads: 'Y'
            };
            this.manageFileSubscript = this.fileService.getRequestOrganizeFilesObservable().subscribe(resp =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.uploadFiles = resp[0];
                this.organizeFiles = resp[1];


            },error =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(error);
            });
            this.fileService.emitGetRequestOrganizeFiles(this.orgExperimentFileParams);


        }


        this.labList = this.gnomexService.labList;



    }

    ngAfterViewInit() {
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


    public getChildrenToRemove(file: any): boolean {
        if (file.PROTECTED && file.type !== "dir") {

            let p = file.PROTECTED === 'Y';
            if(!p){
                this.removedChildren.push(file)
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
            this.removedChildren.push(file);
        }
        return isProtected;
    }


    uploadTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.organizeTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }

        this.uploadSelectedNode = <ITreeNode>event.node;
    }
    uploadTreeOnUnselect(event:any){
        this.uploadSelectedNode = null;
    }

    organizeTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.uploadTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }
        this.organizeSelectedNode = <ITreeNode>event.node;

    }
    organizeTreeOnUnselect(event:any){
        this.organizeSelectedNode = null;
    }

    private renameCallBack = (data) => {
        if(data){
            this.organizeSelectedNode.data.displayName = data;
            this.organizeSelectedNode.data.dirty = 'Y';
            this.organizeTree.treeModel.update();
            this.formGroup.markAsDirty()
        }
    };


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
                        this.formGroup.markAsDirty();
                    }
                }
            }, this.constService.ICON_FOLDER_ADD);
        }
    }

    remove(treeRemovedFrom:string, node:ITreeNode){
        let id:any = '';
        let parentNode: ITreeNode = node.parent;
        let tree:TreeComponent = null;
        let children: any[] = [];

        if(treeRemovedFrom === 'organize'){
            id = this.organizeSelectedNode.id;
            tree = this.organizeTree;
            children = <any[]>parentNode.data.FileDescriptor;
        }else {
            id = this.uploadSelectedNode.id;
            tree = this.uploadTree;
            children = <any[]>parentNode.data.children
        }


        if(!this.isProtected(node.data,true)){
            this.getChildrenToRemove(node.data);

            if(treeRemovedFrom === 'organize'){
                parentNode.data.FileDescriptor =  children.filter(c => c.idTreeNode !== id);
            }else{
                this.uploadFiles = children.filter(c => c.idTreeNode !== id);
            }
            tree.treeModel.update();
        }
        this.uploadSelectedNode = null;
        this.organizeSelectedNode = null;
    }

    attemptRemove(){
        let treeRemovedFrom:string = '';
        let node:ITreeNode = null;

        if(this.organizeSelectedNode){
            treeRemovedFrom = 'organize';
            node = this.organizeSelectedNode;
        }else if(this.uploadSelectedNode){
            treeRemovedFrom = 'upload';
            node = this.uploadSelectedNode;
        }else{
            return;
        }

        if(node.data.hasDataTrack === 'Y'){
            this.dialogService.confirm("Warning","This file is linked to a data track.  Do you want to remove the file and delete the associated data track?")
                .pipe(first()).subscribe(answer =>{
                if(answer) {
                    this.remove(treeRemovedFrom, node);
                }
            });
        }else{
            this.remove(treeRemovedFrom, node);
        }

    }

    openRenameDialog(title:string,placeHolder:string,onClose,imgIcon?:string){
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            imgIcon: imgIcon ? imgIcon : '',
            title: title,
            placeHolder: placeHolder
        };

        config.width = "20em";
        let dialogRef: MatDialogRef<NameFileDialogComponent>  = this.dialog.open(NameFileDialogComponent,config);
        if(onClose){
            dialogRef.afterClosed().subscribe(onClose);
        }

    }


    rename(){
        if(this.organizeSelectedNode){
            let p = this.organizeSelectedNode.data.PROTECTED;
            if( p && p === 'Y'){
                this.dialogService.alert("Warning: Protected files cannot be renamed.");
                return;
            }

            let title ="Rename " + this.organizeSelectedNode.data.displayName;
            this.openRenameDialog(title,'To',this.renameCallBack);
        }

    }
    refresh(){
        if(this.data.type === 'a'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetAnalysisOrganizeFiles(this.orgAnalysisFileParams);
        }else if(this.data.type === 'e'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetRequestOrganizeFiles(this.orgExperimentFileParams);
        }
        this.formGroup.markAsPristine();

    }


    showHelp(){
        this.dialogService.alert(this.organizeHelp);
    }


    requestToCloseDialog(){
        this.closeDialog.emit();
    }

    disableRename():boolean{
        let treeSelected: boolean = !!(!this.organizeSelectedNode );
        let isOrganizeRoot:boolean =  this.organizeSelectedNode ? this.organizeSelectedNode.isRoot : false;
        return treeSelected || isOrganizeRoot;
    }

    disableRemove():boolean{
        let treeSelected: boolean = !!(!this.organizeSelectedNode && !this.uploadSelectedNode);
        let isOrganizeRoot:boolean =  this.organizeSelectedNode ? this.organizeSelectedNode.isRoot : false;
        return treeSelected || isOrganizeRoot;
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






    save(){
        this.dialogService.startDefaultSpinnerDialog();

        if(this.data.type === 'a'){
            let params:HttpParams = new HttpParams()
                .set("filesToRemoveJSONString", JSON.stringify( this.removedChildren))
                .set("filesJSONString", JSON.stringify(this.organizeFiles[0]))
                .set("idAnalysis",  this.data.id.idAnalysis)
                .set("noJSONToXMLConversionNeeded", "Y");

            this.fileService.organizeAnalysisUploadFiles(params).subscribe(resp => {
                this.dialogService.stopAllSpinnerDialogs();
                if(resp && resp.result && resp.result === "SUCCESS"){
                    if(resp.warning){
                        this.dialogService.alert(resp.warning);
                    }
                    this.formGroup.markAsPristine();
                    this.fileService.emitGetAnalysisOrganizeFiles(this.orgAnalysisFileParams);

                }else if(resp.message){
                    this.dialogService.alert(resp.message)
                }
            });

        }else{
            let params:HttpParams = new HttpParams()
                .set("filesToRemoveJSONString", JSON.stringify( this.removedChildren))
                .set("filesJSONString", JSON.stringify(this.organizeFiles[0]))
                .set("idRequest",  this.data.id.idRequest)
                .set("noJSONToXMLConversionNeeded", "Y");

            this.fileService.organizeExperimentFiles(params).subscribe( resp => {
                this.dialogService.stopAllSpinnerDialogs();
                if(resp && resp.result && resp.result === "SUCCESS"){
                    if(resp.warning){
                        this.dialogService.alert(resp.warning);
                    }
                    this.formGroup.markAsPristine();
                    this.fileService.emitGetAnalysisOrganizeFiles(this.orgExperimentFileParams);

                }else if(resp.message){
                    this.dialogService.alert(resp.message)
                }
            });
        }



    }





    ngOnDestroy():void{
        this.manageFileSubscript.unsubscribe();
    }

}
