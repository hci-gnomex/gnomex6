import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';

import {ConstantsService} from "../../services/constants.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {RemoveLinkButtonRenderer} from "../../util/grid-renderers/remove-link-button.renderer";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {UserPreferencesService} from "../../services/user-preferences.service";

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
    public idFieldValue: string = '';
    public idField: string = '';

    public showCollaboratorBlock: boolean = true;

    public enableAdd: boolean = false;

    public collaboratorToAdd: any;

    private gridApi: any;

    private get columnDefs(): any[] {
        return [
            {
                headerName: "Collaborator",
                field: this.prefService.userDisplayField,
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
                private gnomexService: GnomexService,
                public prefService: UserPreferencesService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (!this.data || !this.data.possibleCollaborators || !this.data.idFieldValue || !this.data.idField || !Array.isArray(this.data.possibleCollaborators)) {
            this.dialogRef.close();
        }

        this.idFieldValue = this.data.idFieldValue;
        this.idField = this.data.idField;

        this.currentCollaborators  = [];
        this.addNameToCollabs(this.data.currentCollaborators, this.gnomexService.appUserList);


        for (let collaborator of this.data.currentCollaborators) {
            let deepCopy: any = {
                canUpdate:     '' + collaborator.canUpdate,
                canUploadData: '' + collaborator.canUploadData,
                idAppUser:     '' + collaborator.idAppUser,
                buttonName:    'Remove'
            };
            deepCopy[this.prefService.userDisplayField] = '' + collaborator[this.prefService.userDisplayField];
            deepCopy[this.idField] = '' + collaborator[this.idField];

            this.currentCollaborators.push(deepCopy);
        }

        this.possibleCollaborators = this.data.possibleCollaborators;

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
                idAppUser: this.collaboratorToAdd.idAppUser,
                buttonName: 'Remove'
            };
            newEntry[this.prefService.userDisplayField] = this.collaboratorToAdd[this.prefService.userDisplayField];
            newEntry[this.idField] = this.idFieldValue;

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
                idAppUser:     '' + collaborator.idAppUser,
                buttonName:    'Remove'
            };
            deepCopy[this.prefService.userDisplayField] = '' + collaborator[this.prefService.userDisplayField];
            deepCopy[this.idField] = '' + collaborator[this.idField];

            returnedCollaborators.push(deepCopy);
        }

        this.dialogRef.close(returnedCollaborators);
    }

    addNameToCollabs(currentCollabs:any[],allCollabs:any[]){

        for(let i= 0; i <  currentCollabs.length; i++ ){
            let collab = currentCollabs[i];
            let refCollab = allCollabs.find(ref => collab.idAppUser === ref.idAppUser);
            if(!refCollab){
                console.log("Testing: Could not find collaborator, may need to call getAppUser controller as source");
                break;
            }

            collab[this.prefService.userDisplayField] = refCollab[this.prefService.userDisplayField];
        }

        return currentCollabs;

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