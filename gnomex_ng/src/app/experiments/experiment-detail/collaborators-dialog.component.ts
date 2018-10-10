import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';

import {ConstantsService} from "../../services/constants.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {RemoveLinkButtonRenderer} from "../../util/grid-renderers/remove-link-button.renderer";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";

@Component({
    selector: 'collaborators-dialog',
    templateUrl: './collaborators-dialog.component.html',
    styles: [`

        .no-height { height: 0;   }
        .single-em { width:  1em; }
        
        .no-margin  { margin:  0; }
        .no-padding { padding: 0; }
        
        .title-size { font-size: large; }
        
    `]
})
export class CollaboratorsDialogComponent implements AfterViewInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public context: any = {
        componentParent: this
    };

    private emToPxConversionRate: number = 1;

    public currentCollaborators:  any[] = [];
    public possibleCollaborators: any[] = [];
    public filteredPossibleCollaborators: any[] = [];
    public idRequest: string = '';

    public showCollaboratorBlock: boolean = true;

    public enableAdd: boolean = false;

    public collaboratorToAdd: any;

    private gridApi: any;

    private get columnDefs(): any[] {
        return [
            {
                headerName: "Collaborator",
                field: "displayName",
                width: 200,
                editable:false
            },
            {
                headerName: "Upload",
                field: "canUploadData",
                width:    3.5 * this.emToPxConversionRate,
                maxWidth: 3.5 * this.emToPxConversionRate,
                minWidth: 3.5 * this.emToPxConversionRate,
                editable:false,
                cellRendererFramework: CheckboxRenderer,
                checkboxEditable: true
            },
            {
                headerName: "Update",
                field: "canUpdate",
                width:    3.5 * this.emToPxConversionRate,
                maxWidth: 3.5 * this.emToPxConversionRate,
                minWidth: 3.5 * this.emToPxConversionRate,
                editable:false,
                cellRendererFramework: CheckboxRenderer,
                checkboxEditable: true
            },
            {
                headerName: "",
                cellRendererFramework: IconLinkButtonRenderer,
                field: "buttonName",
                onClick: "removeCollaborator",
                editable: false,
                width:    5 * this.emToPxConversionRate,
                maxWidth: 5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate
            }
        ];
    }


    constructor(public constantsService: ConstantsService,
                private dialogRef: MatDialogRef<CollaboratorsDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (!this.data || !this.data.possibleCollaborators || !this.data.idRequest || !Array.isArray(this.data.possibleCollaborators)) {
            this.dialogRef.close();
        }

        this.currentCollaborators  = [];

        for (let collaborator of this.data.currentCollaborators) {
            let deepCopy: any = {
                canUpdate:     '' + collaborator.canUpdate,
                canUploadData: '' + collaborator.canUploadData,
                displayName:   '' + collaborator.displayName,
                idAppUser:     '' + collaborator.idAppUser,
                idRequest:     '' + collaborator.idRequest,
                buttonName:    'Remove'
            };

            this.currentCollaborators.push(deepCopy);
        }

        this.possibleCollaborators = this.data.possibleCollaborators;
        this.idRequest = this.data.idRequest;

        this.filterPossibleCollaborators();
    }


    ngAfterViewInit(): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }


    public compareByID(itemOne, itemTwo): boolean {
        return itemOne && itemTwo && itemOne.idAppUser == itemTwo.idAppUser;
    }


    public collaboratorDropdownChange(event: any): void {
        if (event && event.value && event.value.idAppUser) {
            this.collaboratorToAdd = event.value;
        } else {
            this.collaboratorToAdd = null;
        }

        if (this.collaboratorToAdd) {
            let existingCollaborator = this.currentCollaborators.filter((a) => {
                return a.idAppUser && a.idAppUser === this.collaboratorToAdd.idAppUser;
            });

            this.enableAdd = existingCollaborator.length === 0;
        } else {
            this.enableAdd = false;
        }
    }

    public addCollaborator(): void {

        if (this.collaboratorToAdd) {
            let newEntry: any = {
                canUpdate: "N",
                canUploadData: "N",
                displayName: this.collaboratorToAdd.displayName,
                idAppUser: this.collaboratorToAdd.idAppUser,
                idRequest: this.idRequest,
                buttonName: 'Remove'
            };

            this.currentCollaborators.push(newEntry);

            this.gridApi.setRowData(this.currentCollaborators);
        }

        this.filterPossibleCollaborators();
    }

    public removeCollaborator(node: any): void {
        this.currentCollaborators = this.currentCollaborators.filter((a) => {
            if (node && node.data && a.idAppUser === node.data.idAppUser) {
                return false;
            }

            return true;
        });

        this.gridApi.setRowData(this.currentCollaborators);

        this.filterPossibleCollaborators();
    }

    private filterPossibleCollaborators(): void {
        this.filteredPossibleCollaborators = this.possibleCollaborators.filter((a) => {
            if (a.isActive !== 'Y') {
                return false;
            }

            for (let currentCollaborator of this.currentCollaborators) {
                if (currentCollaborator.idAppUser && currentCollaborator.idAppUser === a.idAppUser) {
                    return false;
                }
            }

            return true;
        });
    }

    public onClickOkay(): void {
        let returnedCollaborators: any[] = [];

        for (let collaborator of this.currentCollaborators) {
            let deepCopy: any = {
                canUpdate:     '' + collaborator.canUpdate,
                canUploadData: '' + collaborator.canUploadData,
                displayName:   '' + collaborator.displayName,
                idAppUser:     '' + collaborator.idAppUser,
                idRequest:     '' + collaborator.idRequest,
                buttonName:    'Remove'
            };

            returnedCollaborators.push(deepCopy);
        }

        this.dialogRef.close(returnedCollaborators);
    }


    public onCollabGridReady(event: any) {
        this.gridApi = event.api;

        this.gridApi.setColumnDefs(this.columnDefs);
        this.gridApi.setRowData(this.currentCollaborators);

        this.gridApi.sizeColumnsToFit();
    }

    public onGridSizeChanged(event: any): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }
}