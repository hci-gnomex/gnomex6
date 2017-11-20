import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { jqxTreeGridComponent } from "../assets/jqwidgets-ts/angular_jqxtreegrid";

@NgModule({
    imports: [CommonModule],
    declarations: [jqxTreeGridComponent],
    exports: [jqxTreeGridComponent],
})
export class TreeGridModule { }
