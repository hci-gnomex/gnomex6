import {ChangeDetectorRef, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ITreeModel, ITreeNode} from "angular-tree-component/dist/defs/api";
import {Subscription} from "rxjs";

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
        if (node.data[attribute] === value) {
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

}
