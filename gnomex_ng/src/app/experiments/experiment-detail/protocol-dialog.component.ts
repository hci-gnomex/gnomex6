import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";

import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";

@Component({
    selector: "protocol-dialog",
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="full-width full-height flex-container-col padded">
                <div *ngIf="hasAdapters" class="full-width flex-container-row"
                     style="text-align: left; height: 33%">
                    <div class="full-width flex-container-col">
                        <div class="full-width flex-container-row padded">
                            <div class="label label-width flex-nowrap">Read 1 Adapter</div>
                            <div class="flex-grow">
                                    <textarea class="full-width full-height minor-width flex-nowrap"
                                              disabled>{{protocol.adapterSequenceThreePrime}}
                                    </textarea>
                            </div>
                        </div>
                        <div class="full-width flex-container-row padded">
                            <div class="label label-width flex-nowrap ">Read 2 Adapter</div>
                            <div class="flex-grow">
                                    <textarea class="full-width full-height minor-width flex-nowrap"
                                              disabled>{{protocol.adapterSequenceFivePrime}}
                                    </textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="full-width full-height flex-container-row padded-top"
                     style="text-align: left;">
                    <div class="full-width flex-grow">
                            <textarea class="full-width full-height"
                                      disabled>{{protocol.description}}
                            </textarea>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        textarea {
            resize: none;
            background-color: white;
        }

        .label-width {
            min-width: 8rem;
        }

        .minor-width {
            min-width: 7rem;
        }
    `],
})
export class ProtocolDialogComponent extends BaseGenericContainerDialog implements OnInit, AfterViewInit {
    public protocol: any;
    public hasAdapters: boolean = false;
    
    constructor(private dialogRef: MatDialogRef<ProtocolDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
    }

    ngOnInit(): void {
        if (!this.data || !this.data.protocol) {
            this.dialogRef.close();
        }
        
        this.protocol = Array.isArray(this.data.protocol) ? this.data.protocol[0] : this.data.protocol;
        this.hasAdapters = this.data.protocol.hasAdapters === "Y";
    
    }
    
    ngAfterViewInit(): void {
    }

    close(): void {
        this.dialogRef.close();
    }
}
