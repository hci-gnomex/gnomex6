import {ChangeDetectorRef, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ITreeModel, ITreeNode} from "angular-tree-component/dist/defs/api";
import {Subscription} from "rxjs";
import {TreeModel, TreeNode} from "angular-tree-component";
import * as _ from "lodash";
import {FileService} from "./file.service";

@Injectable()
export class UtilService {

    private changeDetectors: ChangeDetectorRef[] = [];
    private keyBeingHeld: boolean = false;

    constructor() {
    }

    public registerChangeDetectorRef(cd: ChangeDetectorRef): void {
        this.changeDetectors.push(cd);
        if (this.changeDetectors.length === 1) {
            window.addEventListener("keydown", this.onKeydown);
            window.addEventListener("keyup", this.onKeyup);
        }
    }

    public removeChangeDetectorRef(cd: ChangeDetectorRef): void {
        this.changeDetectors.splice(this.changeDetectors.indexOf(cd), 1);
        if (this.changeDetectors.length === 0) {
            window.removeEventListener("keydown", this.onKeydown);
            window.removeEventListener("keyup", this.onKeyup);
        }
    }

    private onKeydown:(event: KeyboardEvent) => void = (event: KeyboardEvent) => {
        if (!this.keyBeingHeld && event.repeat) {
            this.keyBeingHeld = true;
            for (let cd of this.changeDetectors) {
                cd.detach();
            }
        }
    };

    private onKeyup:(event: KeyboardEvent) => void = (event: KeyboardEvent) => {
        if (this.keyBeingHeld) {
            for (let cd of this.changeDetectors) {
                cd.reattach();
            }
            this.keyBeingHeld = false;
        }
    };

    public static markChildrenAsTouched(group: FormGroup): void {
        group.markAsTouched();
        if (group.controls) {
            for (let key of Object.keys(group.controls)) {
                if (group.controls[key] instanceof FormGroup) {
                    UtilService.markChildrenAsTouched(group.controls[key] as FormGroup);
                } else if (group.controls[key] instanceof FormControl) {
                    group.controls[key].markAsTouched();
                }
            }
        }
    }

    public static getJsonArray(possibleArray: any, singleItem: any): any[] {
        return possibleArray ? (Array.isArray(possibleArray) ? possibleArray as any[] : [singleItem]) : [];
    }

    public static findTreeNode(tree: ITreeModel, attribute: string, value: string): ITreeNode {
        if (tree && attribute && value && !tree.isEmptyTree()) {
            for (let root of tree.roots) {
                let node: ITreeNode = UtilService.recursivelyCheckTreeNode(root, attribute, value);
                if (node) {
                    return node;
                }
            }
        }

        return null;
    }

    private static recursivelyCheckTreeNode(node: ITreeNode, attribute: string, value: string): ITreeNode {
        if (node.data[attribute] == value) {
            return node;
        } else if (node.hasChildren) {
            for (let child of node.children) {
                let node: ITreeNode = UtilService.recursivelyCheckTreeNode(child, attribute, value);
                if (node) {
                    return node;
                }
            }
        }

        return null;
    }

    public static safelyUnsubscribe(subscription: Subscription): void {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    public static getSubStr(strItem: string, length: number, fromIndex?: number): string {
         return strItem.length > length ? strItem.substr(fromIndex ? fromIndex : 0, length) + "..." : strItem;
    }
    public static getFileNodesToDrag(tree: TreeModel): Set<TreeNode> {
        let nodes: Set<TreeNode> = new Set<TreeNode>();

        // All selected nodes, may have redundant info (e.g. parent and its children selected too)
        for (let activeNode of tree.activeNodes) {
            let parentAlreadyInSet: boolean = false;
            let descendentsAlreadyInSet: any[] = [];
            for (let nodeInSet of nodes) {
                // Child node selected after parent node
                if (activeNode.isDescendantOf(nodeInSet)) {
                    parentAlreadyInSet = true;
                    break;
                }
                // Parent node selected after children nodes
                if (nodeInSet.isDescendantOf(activeNode)) {
                    descendentsAlreadyInSet.push(nodeInSet);
                }
            }
            if (parentAlreadyInSet) {
                continue;
            }
            for (let descendent of descendentsAlreadyInSet) {
                nodes.delete(descendent);
            }
            nodes.add(activeNode);
        }

        return nodes;
    }

    private static recursePurgeDuplicateNodes(node:TreeNode, filterNodesToMove:Set<TreeNode>){
        if(filterNodesToMove.has(node)){
            filterNodesToMove.delete(node);
        }
        if(node.isLeaf){
            return;
        }else{
            for(let n of node.children){
                UtilService.recursePurgeDuplicateNodes(n,filterNodesToMove);
            }
        }

    }
    private static purgeDuplicateNodes(nodes:TreeNode[], filterNodesToMove){
        // we need to skip top level node go to immediate children and recurse them
        for(let n of nodes){
            UtilService.recursePurgeDuplicateNodes(n,filterNodesToMove );
        }

    }


    public static getFileNodesToMove(tree: TreeModel){
        let toOrderNodes: TreeNode[]  = tree.getActiveNodes();
        let copyNodesToMove: TreeNode[] = [];
        toOrderNodes.sort((a,b) => {
            return b.level - a.level ;
        });

        let filterNodesToMove: Set<TreeNode> = new Set<TreeNode>(toOrderNodes);
        for(let n of toOrderNodes ){
            if(!n.isLeaf){
                this.purgeDuplicateNodes(n.children,filterNodesToMove);
            }

        }

        for(let n of filterNodesToMove){
            copyNodesToMove.push(_.cloneDeep(n.data));
        }

        return copyNodesToMove;


    }

    private static activateNodes(startNode:TreeNode, targetNode:TreeNode){
        let currentNode = startNode;
        while(currentNode !== targetNode){
            //let a1 = performance.now();
            // calling set active is a taxing process
            currentNode.setIsActive(true, true );
            //let a2 = performance.now();
            currentNode = currentNode.findNextNode(true);
            //console.log("diff for set active " +  (a2 - a1) )
        }

    }


    public static makeShiftSelection(tree: TreeModel, shiftNode:TreeNode) {
        let clickedNode: TreeNode = tree.getActiveNode();
        let targetNode: TreeNode = null;
        let startNode: TreeNode = null;

        if(clickedNode.position - shiftNode.position < 0 ){
            startNode = clickedNode;
            targetNode = shiftNode;
        }else{
            startNode = shiftNode;
            targetNode = clickedNode;
        }

        UtilService.activateNodes(startNode,targetNode)

    }

}
