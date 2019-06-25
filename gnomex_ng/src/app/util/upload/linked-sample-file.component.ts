import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output, Input} from "@angular/core";
import {Subscription} from "rxjs";
import {DialogsService} from "../popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {ITreeOptions, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode} from "angular-tree-component";
import {ConstantsService} from "../../services/constants.service";
import {first} from "rxjs/operators";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TabChangeEvent} from "../tabs/index";
import {MatDialogConfig} from "@angular/material";
import {NameFileDialogComponent} from "./name-file-dialog.component";
import {FileService} from "../../services/file.service";
import {IFileParams} from "../interfaces/file-params.model";
import {ExperimentsService} from "../../experiments/experiments.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode, RowClickedEvent, RowDragEvent} from "ag-grid-community";
import {ActionType} from "../interfaces/generic-dialog-action.model";


@Component({
    selector: "linked-sample-file",
    templateUrl: "./linked-sample-file.component.html",
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
            background-color: white;
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }

    `]
})
export class LinkedSampleFileComponent implements OnInit, AfterViewInit {
    private manageFileSubscript: Subscription;
    public gridApi: GridApi;
    private gridColDefs: any[];
    public showSpinner: boolean = false;
    public labList: any[] = [];
    public analysis: any;
    public expFileOpts: ITreeOptions;
    public experimentFiles: any[] = [];
    public expOnlyFiles: any[] = [];
    public expFileSelectedNodes: ITreeNode[] = [];
    public sampleFileSelectedNode: RowNode;
    public formGroup: FormGroup;
    public linkedSampleRowData: any[] = [];
    public getNodeChildDetails: any;
    private idCounter: number;
    public expTreeSplitSize: number;
    public showTree: boolean = false;
    public readonly autoToolTip: string ="Let GNomEx try to automatically link samples for you";
    public allowMakeSeqRunFolder:boolean = false;
    public readonly SAMPLE_GROUP:string = "SampleGroup";
    public readonly SAMPLE:string = "Sample";
    public readonly SEQ_FOLDER:string = "SeqRunNumber";
    public readonly FILE = "FileDescriptor";
    public actionType: any = ActionType.SECONDARY ;


    private readonly sampleHierarchyRules = {
        'SampleGroup': "Sample",
        'Sample': "SeqRunNumber",
        'SeqRunNumber': "FileDescriptor"
    };
    private filterFn = (node:TreeNode)=>{
        let nData = node.data;
        if(nData.type === 'dir'){
            return nData.FileDescriptor.length > 0 ? nData.show : false;
        }else {
            return nData.show;
        }
    };


    @ViewChild('experimentFileTree')
    private experimentFileTree: TreeComponent;

    @Output() closeDialog = new EventEmitter<TabChangeEvent>();
    @Input('manageData') data: IFileParams;


    constructor(
        private gnomexService: GnomexService,
        private experimentService: ExperimentsService,
        private fileService: FileService,
        private fb:FormBuilder,
        public constService: ConstantsService,
        private dialogService: DialogsService) {
    }

    ngOnInit() {
        this.formGroup = this.fb.group({
            linkedSampleFiles: [],
            addedLinkedSampleFiles: [],
            unlinkedSampleFiles:[],
            linkedSampleParams: {}
        });
        this.fileService.addManageFilesForm("LinkedSampleFileComponent", this.formGroup);

        this.idCounter = 0;
        this.expTreeSplitSize = 0;

        this.gridColDefs = [
            {
                headerName: "Sample ID",
                field: "displayName",
                cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true},
                rowDrag: true
            },
            {headerName: "Name", field: "name", width: 150, maxWidth: 150},
            {headerName: "Date", field: "lastModifyDateDisplay", width: 150, maxWidth: 150},
            {headerName: "Size", field: "fileSizeText", width: 150, maxWidth: 150, type: "numericColumn"},
        ];

        this.getNodeChildDetails = function getItemNodeChildDetails(rowItem) {
            let children: any[] = [];
            if (rowItem.SampleGroup) {
                for (let sg of rowItem.SampleGroup) {
                    children.push(sg);
                }
            }
            if (rowItem.Sample) {
                for (let s of rowItem.Sample) {
                    children.push(s);
                }
            }
            if (rowItem.SeqRunNumber) {
                for (let srn of rowItem.SeqRunNumber) {
                    children.push(srn);
                }
            }
            if (rowItem.FileDescriptor) {
                for (let fd of rowItem.FileDescriptor) {
                    children.push(fd);
                }
            }

            if (children.length > 0) {

                return {
                    group: true,
                    expanded: true,
                    children: children,
                    key: rowItem.idTreeGrid
                };
            } else {
                return null;
            }
        };


        this.expFileOpts = {
            displayField: 'displayName',
            childrenField: this.FILE,
            useVirtualScroll: true,
            idField: 'idTreeNode',
            nodeHeight: 22,
            allowDrag: (node: any) => {
                return false
            },
            allowDrop: (element, item: { parent: any, index }) => {
                return false;
            },
            actionMapping: {
                mouse: {
                    click: (tree, node, $event) => {
                        if (node.data.type !== 'dir' && !node.isRoot) {
                            $event.ctrlKey
                                ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
                                : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event)

                        }
                    }
                }
            }
        };


        this.manageFileSubscript = this.fileService.getLinkedSampleFilesSubject().subscribe(resp => {
            if (!resp.message) {
                let filterFileNodes = [];
                this.linkedSampleRowData = resp[0];
                this.prepSampleGridData(this.linkedSampleRowData);
                this.experimentFiles = resp[1];
                this.prepExpFilesTreeData(this.experimentFiles);
                this.formGroup.get("linkedSampleFiles" ).setValue(this.linkedSampleRowData);
                this.formGroup.get("addedLinkedSampleFiles").setValue([]);
                this.formGroup.get("unlinkedSampleFiles").setValue([]);
                this.dialogService.stopAllSpinnerDialogs();

            } else {
                this.dialogService.alert(resp.message);
                this.dialogService.stopAllSpinnerDialogs();
            }

        }, err => {
            this.dialogService.alert(err.message);
            this.dialogService.stopAllSpinnerDialogs();

        });
        this.fileService.emitGetLinkedSampleFiles({idRequest: this.data.id['idRequest']});


    }

    public prepareView(showTree:boolean) {
        this.expTreeSplitSize = 30;
        this.showTree = showTree;
    }


    private prepExpFilesTreeData(gridData: any, noPrep?:boolean) {
        let prepStatus = noPrep ? noPrep : false;
        this.expOnlyFiles = [];
        if (gridData && gridData[0]) {
            this.recursePrepExpFilesTreeData(gridData[0],prepStatus);
        }
    }

    private recursePrepExpFilesTreeData(experimentFile: any,noPrep:boolean) {
        experimentFile.show = noPrep ? experimentFile.show :  true;

        if (experimentFile  && !experimentFile.FileDescriptor) { // file
            if(noPrep){
                if(experimentFile.show){
                    this.expOnlyFiles.push(experimentFile);
                }
            }else{
                if (experimentFile.linkedSampleNumber) {
                    experimentFile.show = false;
                }
            }

            return;
        }

        let fileDescriptors = <any[]>experimentFile.FileDescriptor;
        for (let fd of fileDescriptors) {
            this.recursePrepExpFilesTreeData(fd,noPrep);
        }
    }


    private prepSampleGridData(gridData: any) {
        if (typeof gridData === 'string') {
            return;
        } else if (!Array.isArray(gridData) && typeof gridData === 'object') {
            if (!gridData.displayName) {
                gridData.displayName = ""
            }
            gridData.idTreeGrid = this.idCounter++;
        }

        for (let key in gridData) {
            let sampleData = gridData[key];
            this.prepSampleGridData(sampleData);

        }

    }


    ngAfterViewInit() {
    }

    onTreeInit(event) {
        this.experimentFileTree.treeModel.filterNodes(this.filterFn);

        let tree: TreeModel = event.treeModel;
        tree.expandAll();
    }


    onMove(event) {
        let nodeEvent = event.node;
        let node = this.experimentFileTree.treeModel.getNodeById(nodeEvent.idTreeNode);
        let parentNode = this.experimentFileTree.treeModel.getNodeById(event.to.parent.idTreeNode);
        node.data.dirty = 'Y';
        node.focus();
        parentNode.expand();
        this.formGroup.markAsDirty();
    }

    canLink(autoLink: boolean, toData: any, fromData: any): boolean {
        if(!autoLink){
            return true;
        }
        let toName = <string>(toData.name ? toData.name : toData.displayName);
        let fromName = <string>fromData.displayName;

        if(fromName.includes(toName)){
            return true;
        }
        return false;

    }

    autoLinkSample(){
        this.prepExpFilesTreeData(this.experimentFiles, true);
        this.expOnlyFiles =  this.expOnlyFiles.map(f =>{
            return {data: f};
        });

        for (let sample of  this.linkedSampleRowData){
            let sampleNode = {data:sample}; // to keep standard format passing a 'node' like tree and grid have
            if(this.addToRow(this.expOnlyFiles,sampleNode,false, true)){
                this.gridApi.setRowData(this.linkedSampleRowData);
                this.experimentFileTree.treeModel.filterNodes(this.filterFn);
            }
        }

    }


    experimentFileTreeOnSelect(event: any) {
        this.expFileSelectedNodes = this.experimentFileTree.treeModel.getActiveNodes();

    }

    experimentFileTreeOnUnselect(event: any) {
        this.expFileSelectedNodes = [];
    }


    isAddActive() {
        return !!(this.sampleFileSelectedNode && this.expFileSelectedNodes.length > 0);
    }

    addToRow(from: any[], to: any, sampleInitiated:boolean, autoLink:boolean): boolean {
        let added: boolean = false;
        let errorMessage = "";

        for (let i = 0; i < from.length; i++) {
            let fromNodeName: any = from[i].data.xmlNodeName ? from[i].data.xmlNodeName : this.FILE;
            let toNodeName = to.data.xmlNodeName;

            if(fromNodeName === this.FILE && toNodeName === this.SEQ_FOLDER){
                let toFileDescriptors:any[] =  to.data[fromNodeName] ? to.data[fromNodeName] : [];
                let numbOfFromItems:number = from.length;
                if(toFileDescriptors.length + numbOfFromItems > 2 && i == 0 ){
                    errorMessage = "A Seq Run Folder can only contain two Experiment Files.\n  Please remove one Experiment File from this folder and try again.";
                    added = false;
                    break;
                }
            }

            if (fromNodeName === this.FILE && toNodeName === this.SAMPLE) {
                let addedChildNode = to.data;
                if(!this.canLink(autoLink,to.data,from[i].data)){
                    continue;
                }
                for (let j = 0; j < 2; j++) {
                    let fromNodeName = this.sampleHierarchyRules[toNodeName];
                    if (fromNodeName) {
                        if (j === 0) { // new seqRunNumber
                            let displayName = '';
                            let id = ++this.idCounter;
                            let icon = this.constService.ICON_FOLDER;
                            if (addedChildNode[fromNodeName] && Array.isArray(addedChildNode[fromNodeName])) {
                                addedChildNode[fromNodeName].push({displayName: displayName, idTreeGrid: id, xmlNodeName: fromNodeName, icon: icon});
                                let len: number  = addedChildNode[fromNodeName].length;
                                addedChildNode = addedChildNode[fromNodeName][len - 1];
                            } else { // new
                                addedChildNode[fromNodeName] = [{displayName: displayName, idTreeGrid: id, xmlNodeName: fromNodeName, icon: icon}];
                                addedChildNode = addedChildNode[fromNodeName][0];
                            }
                            toNodeName = fromNodeName;
                        } else { // existing FileDescriptor
                            from[i].data.show = false;
                            from[i].data.idTreeGrid = ++this.idCounter;
                            if(addedChildNode[fromNodeName]){
                                let len: number  = addedChildNode[fromNodeName].length;
                                addedChildNode[fromNodeName].push(from[i].data);
                            }else{
                                addedChildNode[fromNodeName] = [from[i].data];
                            }

                            this.formGroup.get("addedLinkedSampleFiles").value.push(from[i].data);
                            if(sampleInitiated){ // if initaited on sample grid then the file descriptor has be been linked before thus 'unlink'
                                this.formGroup.get("unlinkedSampleFiles").value.push(from[i].data);
                            }

                        }
                    } else {
                        added = false;
                        errorMessage = "Cannot add a " + fromNodeName + " to " + toNodeName;
                        break;
                    }
                    added = true;
                }

            } else if (fromNodeName === this.sampleHierarchyRules[toNodeName]
                || (fromNodeName === toNodeName && fromNodeName === this.SAMPLE_GROUP)) {

                from[i].data.idTreeGrid = ++this.idCounter;
                from[i].data.show = false;
                if (Array.isArray(to.data[fromNodeName])) {
                    to.data[fromNodeName].push(from[i].data);
                } else {
                    to.data[fromNodeName] = [from[i].data];
                }

                if(fromNodeName ===  this.FILE){
                    this.formGroup.get("addedLinkedSampleFiles").value.push(from[i].data);
                    if(sampleInitiated){ // if initaited on sample grid then the file descriptor has be been linked before thus 'unlink'
                        this.formGroup.get("unlinkedSampleFiles").value.push(from[i].data);
                    }
                }else if(fromNodeName === this.SEQ_FOLDER){
                    let seqRunChildren = from[i].data[this.FILE];
                    let fileDescriptors:any[] = seqRunChildren && Array.isArray(seqRunChildren) ? seqRunChildren : [];
                    for(let fd of fileDescriptors){
                        this.formGroup.get("addedLinkedSampleFiles").value.push(fd);
                        if(sampleInitiated){ // if initaited on sample grid then the file descriptor has be been linked before thus 'unlink'
                            this.formGroup.get("unlinkedSampleFiles").value.push(fd);
                        }
                    }
                }

                added = true;
            } else {
                errorMessage = "Cannot add a " + fromNodeName + " to " + toNodeName;
                added = false;
            }
            if (!added && !autoLink) {
                break;
            }

        }

        if(!added && !autoLink){
            this.dialogService.alert(errorMessage );
        }

        return added

    }

    newSeqRunFolder(event){
        let seqRunFolder = {
            xmlNodeName: this.SEQ_FOLDER,
            icon: this.constService.ICON_FOLDER_DISABLE,
            displayName: ""
        };
        this.add([{data: seqRunFolder}]);
        this.sampleFileSelectedNode = null;

    }
    newSampleGroupFolder(event){
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            placeHolder: "Folder Name"
        };
        config.minWidth='35em';

        this.dialogService.genericDialogContainer(NameFileDialogComponent, "Add New Folder", this.constService.ICON_FOLDER_ADD, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "OK", internalAction: "applyChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).pipe(first()).subscribe(data => {
                    if(data) {
                        let sampleGroupObj: any = {
                            displayName: data,
                            xmlNodeName: this.SAMPLE_GROUP,
                            icon: this.constService.ICON_FOLDER_DISABLE,
                        };

                        if (this.sampleFileSelectedNode) {
                            this.add([{data: sampleGroupObj}]);
                        } else {
                            sampleGroupObj.idTreeGrid = ++this.idCounter;
                            this.linkedSampleRowData.push(sampleGroupObj);
                            this.gridApi.setRowData(this.linkedSampleRowData);
                        }
                    }
        });

    }


    add(fromNode?:any[]) {
        if(fromNode){
            if (this.addToRow(fromNode, this.sampleFileSelectedNode,false, false)) {
                this.gridApi.setRowData(this.linkedSampleRowData);
                this.experimentFileTree.treeModel.filterNodes(this.filterFn);
                this.sampleFileSelectedNode = null;
                this.formGroup.markAsDirty();
            }
        }else{
            if (this.addToRow(this.expFileSelectedNodes, this.sampleFileSelectedNode,false, false)) {
                this.gridApi.setRowData(this.linkedSampleRowData);
                this.experimentFileTree.treeModel.filterNodes(this.filterFn);
                this.sampleFileSelectedNode = null;
                this.expFileSelectedNodes = [];
                this.formGroup.markAsDirty();
            }
        }

    }

    removeFromSibling(nodeType: string, treeGridNode: RowNode): number {
        let i = -1;
        if (treeGridNode.parent) {
            let siblingNodes: any[] = treeGridNode.parent.data[nodeType];
            if (siblingNodes) {
                i = siblingNodes.indexOf(treeGridNode.data);
                siblingNodes.splice(i, 1);
            }
        } else {
            i = this.linkedSampleRowData.indexOf(treeGridNode.data);
            this.linkedSampleRowData.splice(i, 1);
        }

        return i;
    }

    getChildNodes(treeGridNode: RowNode): any[] {
        let nodeData = treeGridNode.data;
        let childrenNodeList: any[] = [];
        for (let n in nodeData) {
            if (Array.isArray(nodeData[n])) {
                let tempNodeList = nodeData[n];
                for (let cNode of tempNodeList) {
                    childrenNodeList.push({data: cNode}); // making 'dummy' node with property data to match format else where;
                }
            }
        }
        return childrenNodeList;
    }

    undoAddSampleFile(file:any){
        let addedSFiles = (<any[]>this.formGroup.get("addedLinkedSampleFiles").value);
        let i = addedSFiles.indexOf(file);
        if(addedSFiles.indexOf(file) != -1 ){
            addedSFiles.splice(i,1);
        }

    }

    remove(){
        this.removeFromRow(false);
    }

    removeFromRow(sampleInitiated:boolean, fromNode?:RowNode,) {
        let sampNode = null;

        if(fromNode){
            sampNode = fromNode;
        }else {
            sampNode = this.sampleFileSelectedNode;
        }
        let nodeName = sampNode.data.xmlNodeName ? sampNode.data.xmlNodeName : this.FILE;
        let removed: boolean = false;
        let fileLookupList: any[] = []; // incase that we're removing previous saved linked sample file
        // will need to search exp file tree for it and remove it


        if (nodeName === this.SAMPLE) {
            if(sampleInitiated){
                this.removeFromSibling(nodeName, sampNode)
            }else{
                this.dialogService.alert("Sample(s) cannot be deleted. ");
            }

        } else if (nodeName === this.SAMPLE_GROUP) {
            let removedIdx: number = this.removeFromSibling(nodeName, sampNode);

            if(!sampleInitiated){
                let childrenNodeDataList: any[] = this.getChildNodes(sampNode);
                if (sampNode.parent) {
                    this.addToRow(childrenNodeDataList, sampNode.parent,false,false )
                } else {
                    this.linkedSampleRowData = this.linkedSampleRowData.concat(childrenNodeDataList.map(cNode => cNode.data));
                }

            }
            removed = true;
        } else if (nodeName === this.SEQ_FOLDER) {
            let fileDescriptors: any[] = sampNode.data[this.FILE];
            if (fileDescriptors && Array.isArray(fileDescriptors)) {
                for (let fd of fileDescriptors) {
                    fd.show = sampleInitiated ? false : true;
                    if (fd.idExperimentFile) { // only existing linked sample files have this idExperimentFile
                        fileLookupList.push(fd);
                    }
                    if(!sampleInitiated){
                        this.undoAddSampleFile(fd);
                    }
                }
            }

            this.removeFromSibling(nodeName, sampNode);
            removed = true;

        } else { // removing file descriptor
            sampNode.data.show = sampleInitiated ? false : true;
            this.removeFromSibling(nodeName, sampNode);
            let fileDescriptors: any[] = sampNode.parent.data[this.FILE];
            if (fileDescriptors.length == 0) {
                this.removeFromSibling(this.SEQ_FOLDER, sampNode.parent);
            }
            // tells us the linked sample file was saved previously
            if (sampNode.data.idExperimentFile) {
                fileLookupList.push(sampNode.data);
            }

            this.undoAddSampleFile(sampNode.data);
            removed = true;
        }

        if (removed && !sampleInitiated) { // if sampleInitiated the addToRow method has already ran this logic don't want to run again
            this.experimentFileTree.treeModel.filterNodes((node: TreeNode) => {
                if( !(node.data.type === 'dir') && !node.isRoot ){
                    for (let file of fileLookupList) {
                        if (file.zipEntryName === node.data.zipEntryName) {
                            node.data.show = file.show;
                            break;
                        }
                    }
                }

                return node.data.show;
            });

            this.gridApi.setRowData(this.linkedSampleRowData);
            this.formGroup.get("linkedSampleFiles").setValue(this.linkedSampleRowData);
            this.formGroup.get("unlinkedSampleFiles").value.push(...fileLookupList);
            this.sampleFileSelectedNode = null;
            this.formGroup.markAsDirty();

        }


    }



    requestToCloseDialog(){
        this.closeDialog.emit();
    }


    expandFolders(){
        if(this.expFileSelectedNodes.length > 0){
            this.expFileSelectedNodes[0].expandAll();
        }else{
            this.experimentFileTree.treeModel.expandAll();
        }
    }
    collapseFolders(){
        if(this.expFileSelectedNodes.length > 0){
            this.expFileSelectedNodes[0].collapseAll();
        }else{
            this.experimentFileTree.treeModel.collapseAll();
        }
    }


    public onGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.gridColDefs);
        event.api.sizeColumnsToFit();
        this.gridApi = event.api;
    }
    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }
    public selectedGridRow(event: RowClickedEvent){
        if(event.node.isSelected()){
            event.node.setSelected(false,true);
            this.sampleFileSelectedNode = null;
        }else{
            event.node.setSelected(true, true);
            if(event.node){
                this.sampleFileSelectedNode = event.node;
            }
        }

        this.allowMakeSeqRunFolder = event.node.data.xmlNodeName === this.SAMPLE;

    }

    onRowDragEnd(event: RowDragEvent){
        let fromNode : RowNode = event.node;
        let toNode : RowNode = event.overNode;
        if(this.addToRow([fromNode], toNode,true,false)){
            this.removeFromRow(true, fromNode);
            this.gridApi.setRowData(this.linkedSampleRowData);
        }
    }

    private requestSave():void{
        this.fileService.emitSaveManageFiles();
    }

    save(){ // save is called by manage-files-dialog

        let addedFiles =  this.formGroup.get("addedLinkedSampleFiles").value;
        let linkSamp = this.formGroup.get("linkedSampleFiles").value;
        let unlinkSamp = this.formGroup.get("unlinkedSampleFiles").value;
        let params: any = {
            "experimentFileJSONString": JSON.stringify( addedFiles),
            "linkedSampleFileJSONString": JSON.stringify(linkSamp),
            "filesToUnlinkJSONString" : JSON.stringify(unlinkSamp)
        };
        this.formGroup.get("linkedSampleParams").setValue(params);
        this.experimentFiles = [];
    }


    ngOnDestroy():void{
        this.manageFileSubscript.unsubscribe();
    }

}

function getDownloadGroupRenderer() {
    function DownloadGroupRenderer() {
    }

    DownloadGroupRenderer.prototype.init = function(params) {
        let tempDiv = document.createElement("div");
        if (params.data.icon) {
            if(params.data.idSample){
                tempDiv.innerHTML = '<span><img src="' + params.data.icon + '" class="icon"/>' + params.data.number + '</span>';
            }else{
                tempDiv.innerHTML = '<span><img src="' + params.data.icon + '" class="icon"/>' + params.value + '</span>';
            }
        } else {
            if(params.data.idSample){
                tempDiv.innerHTML = '<span >' + params.data.number + '</span>';
            }else{
                tempDiv.innerHTML = '<span >' + params.value + '</span>';
            }

        }
        this.eGui = tempDiv.firstChild;
    };

    DownloadGroupRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return DownloadGroupRenderer;
}
