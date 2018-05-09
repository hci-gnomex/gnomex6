



import {Component, Inject, Input, OnInit} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";


@Component({
    template: `
       <div style="display: flex; flex-direction: column; height: 100%;" >
           <div style="height: 100%;">
               <configure-annotations [orderType]="filterByOrder" ></configure-annotations>
           </div>
       </div>
       
       
        
    `,
    styles: [``]
})

export class ConfigAnnotationDialogComponent implements OnInit {

    public filterByOrder:string = '';

    constructor(private dialogRef: MatDialogRef<ConfigAnnotationDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any) {
    }

    ngOnInit() {

       this.filterByOrder = this.data.orderType;
    }


}
