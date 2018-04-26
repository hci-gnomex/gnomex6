/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from "@angular/core";
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {TopicService} from "../services/topic.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    template: `
        <div> This is the temp Topic screen</div>
    `
})

export class TopicDetailComponent implements OnInit{

    constructor(private route:ActivatedRoute) {

    }

    ngOnInit(){
        this.route.data.forEach(data =>{
            console.log(data);
        })
    }
}
