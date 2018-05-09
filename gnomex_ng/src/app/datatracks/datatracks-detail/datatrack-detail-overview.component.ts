/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";




@Component({
    template: `        
            <div style="display:flex; flex-direction:column; height:100%; width:100%;">
                <!--  <img [src]="dtService.datatrackListTreeNode.icon">Genome Build: -->
                <div style="padding-bottom: .5em;padding-left:1em;">
                   
                    {{"test"}}
                </div>
                <div style="display:flex; flex: 1;">

                    <mat-tab-group style="height:100%; width:100%;" class="mat-tab-group-border"
                                   (selectedTabChange)="tabChanged($event)">
                        <mat-tab style="height:100%" label="Summary">
                            Hello again again
                        </mat-tab>
                        <mat-tab style="height:100%" label="Annotations">
                            <dt-annotation-tab [annotations]="annotations"></dt-annotation-tab>
                        </mat-tab>
                        <mat-tab style="height:100%;" label="Sequences Files">
                            Hello
                        </mat-tab>
                    </mat-tab-group>
                </div>
                <div>
                    <save-footer (saveClicked)="save()" [disableSave]="!canWrite"
                                 [dirty]="false"></save-footer>
                </div>


            </div>
`,

    styles: [`


        .flex-container{
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }


`]
})
export class DatatracksDetailOverviewComponent implements OnInit, OnDestroy{
    private datatrack: any;
    private annotations: IAnnotation[];

    constructor(private dataTrackService:DataTrackService,private route:ActivatedRoute){
    }

    ngOnInit(){

        this.route.data.forEach(data =>{
           this.datatrack =  data.datatrack;
           if(this.datatrack){
               let annots = this.datatrack.DataTrackProperties;
               if(annots){
                   this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                   for(let i = 0; i < this.annotations.length; i++){
                       let propertyOptions = this.annotations[i].PropertyOption;
                       if(propertyOptions){
                           this.annotations[i].PropertyOption =  Array.isArray(propertyOptions)? propertyOptions :  <IAnnotationOption[]>[propertyOptions];
                       }
                   }
               }else{
                   this.annotations = [];
               }

           }else{
                this.annotations = [];
           }



        })


    }
    ngOnDestroy(){

    }
    save(){

    }

    tabChanged(event:any){

    }



}
