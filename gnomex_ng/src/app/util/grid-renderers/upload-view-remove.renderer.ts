import {Component, ElementRef, ViewChild} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";
import {BillingPOFormService} from "../../services/billingPOForm.service";
import {DialogsService, DialogType} from "../popup/dialogs.service";

@Component({
    template: `
        <div class="full-width full-height" role="gridcell">
            <div class="t full-width full-height cursor">
                <div class="tr">
                    <div class="td vertical-center button-container" role="group" aria-label="File actions">
                        <input type="file" class="hidden" (change)="selectFile($event)" #fileInput aria-label="File upload input">
                        <button *ngIf="!disableEdit" class="link-button" (click)="onClickUpload()" aria-label="Upload file">
                            <img [src]="'./assets/upload.png'" alt="" aria-hidden="true"/>
                            <div class="name inline-block">
                                Upload
                            </div>
                        </button>
                        <button *ngIf="hasPoForm" class="link-button"
                                (click)="onClickView()" aria-label="View file">
                            <img [src]="'./assets/page_find.gif'" alt="" aria-hidden="true"/>
                            <div class="name inline-block">
                                View
                            </div>
                        </button>
                        <button *ngIf="hasPoForm && !disableEdit" class="link-button"
                                (click)="onClickRemove()" aria-label="Remove file">
                            <img [src]="'./assets/page_cross.gif'" alt="" aria-hidden="true"/>
                            <div class="name inline-block">
                                Remove
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./upload-view-remove.renderer.scss']
})
export class UploadViewRemoveRenderer implements ICellRendererAngularComp {
    public params: any;
    public hasPoForm: boolean;
    public file: any;
    public disableEdit: boolean = false;

    @ViewChild('fileInput', {static: false}) fileInput: ElementRef;

    constructor(private poFormService: BillingPOFormService,
                private dialogService: DialogsService) {}

    agInit(params: any): void {
        this.params = params;
        this.hasPoForm = false;

        if (this.params && this.params.data) {
            this.disableEdit = !!this.params.column.colDef.disableEdit;
        }

        this.checkIfHasPoForm();
    }

    refresh(params: any): boolean {
        return false;
    }

    checkIfHasPoForm(): void {
        if (this.params && this.params.data
            && this.params.data.purchaseOrderForm && this.params.data.purchaseOrderForm !== ''
            && this.params.data.orderFormFileType && this.params.data.orderFormFileType !== ''
            && this.params.data.orderFormFileSize && this.params.data.orderFormFileSize !== '') {
            this.hasPoForm = true;
        } else {
            this.hasPoForm = false;
        }
    }

    public onClickUpload(): void {
        if (this.hasPoForm) {
            let message: string = "By uploading a new purchase form you will overwrite the existing purchase form.\n\n" +
                "Continue anyway?";
            this.dialogService.confirm(message).subscribe((result: any) => {
                if(result) {
                    this.triggerFileSelector();
                }
            });
        } else {
            this.triggerFileSelector();
        }
    }

    private triggerFileSelector() {
        this.fileInput.nativeElement.value = null;
        this.fileInput.nativeElement.click();
    }

    selectFile(event: any) {
        if(event.target.files && event.target.files.length > 0) {
            this.file = event.target.files[0];

            let formData: FormData = new FormData();
            formData.append("Filename", this.file.name);
            formData.append("format", this.file.type === "text/html" ? "html" : "text");
            formData.append("idBillingAccount", this.params.data.idBillingAccount);
            formData.append("Filedata", this.file, this.file.name);

            this.poFormService.uploadNewForm(formData).subscribe((uploadWasSuccessful) => {
                if (uploadWasSuccessful) {
                    this.dialogService.alert("File uploaded successfully", "", DialogType.SUCCESS);
                } else {
                    this.dialogService.alert("File failed to upload.", "", DialogType.FAILED);
                }

                this.hasPoForm = this.hasPoForm || uploadWasSuccessful;
            });
        }
    }

    public onClickView():void {
        let billingAccount:number = this.params.data.idBillingAccount;
        let url:string = 'GetPurchaseOrderForm.gx?idBillingAccount=' + billingAccount;
        window.open(url, '_blank');
    }

    public onClickRemove():void {
        if (this.poFormService && this.params && this.params.data) {
            this.poFormService.deletePoFormFromBillingAccount(this.params.data.idBillingAccount).subscribe((deleteWasSuccessful) => {
                this.hasPoForm = !deleteWasSuccessful;

                if (deleteWasSuccessful) {
                    this.dialogService.alert("File successfully removed", "", DialogType.SUCCESS);
                }
            });
        }
    }
}
