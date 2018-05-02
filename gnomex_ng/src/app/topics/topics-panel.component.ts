/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {TopicService} from "../services/topic.service";





@Component({
    selector: 'topics-panel',
    template: `        
        <div style="height:100%;">
            <router-outlet name="topicsPanel"></router-outlet>
        </div>
`
})
export class TopicsPanelComponent implements OnInit, OnDestroy{

    constructor(private router:Router,
                private topicService:TopicService){
    }

    ngOnInit(){

    }
    ngOnDestroy(){
    }
    save(){

    }


}
