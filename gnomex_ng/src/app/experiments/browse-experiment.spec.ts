import {Http, HttpModule, URLSearchParams} from "@angular/http";
import {ExperimentsService} from "./experiments.service";
import {BrowseExperimentsComponent} from "./browse-experiments.component"
import {} from 'jasmine';
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {Component, DebugElement, Directive} from "@angular/core";
import {TreeComponent, TreeModule, TreeNode} from "angular-tree-component";
import {FormsModule} from "@angular/forms";
import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {AppUserListService} from "../services/app-user-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DictionaryService} from "../services/dictionary.service";
import {AnalysisService} from "../services/analysis.service";
import {DataTrackService} from "../services/data-track.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {By} from "@angular/platform-browser";
import {UtilModule} from "../util/util.module";
import { RouterTestingModule } from '@angular/router/testing';
import {ProgressService} from "../home/progress.service";
import {BillingService} from "../services/billing.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {AngularSplitModule} from "angular-split";
import {BrowsePanelComponent} from "./browse-panel.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {CookieUtilService} from "../services/cookie-util.service";
import {CookieService} from "angular2-cookie/services";
import {ConstantsService} from "../services/constants.service";
import {of} from "rxjs";

@Directive({

    selector: 'jqxLoader',

})

class MockAppUserListService extends AppUserListService {
    constructor() {
        var _http:Http;
        super(_http);
    }
    getMembersOnly() {
        return of([
        ])
    }
    getAppUserList() {
        return of([
        ])
    }
}

class MockCreateSecurityAdvisorService extends CreateSecurityAdvisorService {

    public get myCoreFacilities(): any[] {
        var result: any[] = [];
        result.concat("1");
        return result;
    }
}



class MockExperimentService extends ExperimentsService {
    constructor() {
        console.log("in test constructor");
        var _http:Http;
        super(_http, "world");
    }

    getProjectRequestList_fromBackend(params: URLSearchParams): void {
        this.projectRequestList = [
            {
                "idLab": "321",
                "labName": "Jay Agarwal Lab",
                "projectLabName": "Jay Agarwal Lab",
                "label": "Jay Agarwal Lab",
                "Project": {
                    "idProject": "56487",
                    "projectName": "XRT DNA",
                    "label": "XRT DNA",
                    "projectDescription": "",
                    "ownerFirstName": "Layla",
                    "ownerLastName": "Anderson",
                    "idLab": "321",
                    "idAppUser": "1023",
                    "Request": {
                        "idRequest": "29749",
                        "requestNumber": "S436R",
                        "requestCreateDate": "20151222",
                        "requestCreateDateDisplay": "2015-12-22",
                        "requestCreateDateDisplayMedium": "Dec 22, 2015",
                        "createDate": "12/22/2015",
                        "idSlideProduct": "0",
                        "idLab": "321",
                        "idAppUser": "1023",
                        "codeRequestCategory": "MDSQ",
                        "icon": "assets/chart_line.png",
                        "codeApplication": "APP91",
                        "labName": "Jay Agarwal Lab",
                        "slideProductName": "",
                        "projectLabName": "Jay Agarwal Lab",
                        "projectName": "XRT DNA",
                        "codeVisibility": "MEM",
                        "ownerFirstName": "Layla",
                        "ownerLastName": "Anderson",
                        "isExternal": "N",
                        "name": "landerson-S436R",
                        "isDirty": "N",
                        "isSelected": "N",
                        "analysisNames": "",
                        "idInstitution": "",
                        "hasQcWorkItems": "N",
                        "idSubmitter": "1023",
                        "hasMultipleAccounts": "N",
                        "canOpenNewBillingTemplate": "N",
                        "requestPublicNote": "",
                        "canUpdateVisibility": "Y",
                        "displayName": "S436R - landerson-S436R - Agilent Tape Station - Layla Anderson Dec 22, 2015",
                        "label": "S436R - landerson-S436R - Agilent Tape Station - Layla Anderson Dec 22, 2015"
                    }
                }
            },
            {
                "idLab": "1449",
                "labName": "Dan Albertson Lab",
                "projectLabName": "Dan Albertson Lab",
                "label": "Dan Albertson Lab",
                "Project": {
                    "idProject": "59911",
                    "projectName": "Experiments for Daniel Albertson",
                    "label": "Experiments for Daniel Albertson",
                    "projectDescription": "",
                    "ownerFirstName": "Daniel",
                    "ownerLastName": "Albertson",
                    "idLab": "1449",
                    "idAppUser": "2252",
                    "Request": [
                        {
                            "idRequest": "29174",
                            "requestNumber": "S414R",
                            "requestCreateDate": "20151109",
                            "requestCreateDateDisplay": "2015-11-09",
                            "requestCreateDateDisplayMedium": "Nov 9, 2015",
                            "createDate": "11/09/2015",
                            "idSlideProduct": "0",
                            "idLab": "1449",
                            "idAppUser": "2252",
                            "codeRequestCategory": "NANO",
                            "icon": "assets/nano.png",
                            "codeApplication": "NANHPCP",
                            "labName": "Dan Albertson Lab",
                            "slideProductName": "",
                            "projectLabName": "Dan Albertson Lab",
                            "projectName": "Experiments for Daniel Albertson",
                            "codeVisibility": "MEM",
                            "ownerFirstName": "Daniel",
                            "ownerLastName": "Albertson",
                            "isExternal": "N",
                            "name": "dalbertson-S414R",
                            "isDirty": "N",
                            "isSelected": "N",
                            "analysisNames": "",
                            "idInstitution": "",
                            "hasQcWorkItems": "N",
                            "idSubmitter": "2252",
                            "hasMultipleAccounts": "N",
                            "canOpenNewBillingTemplate": "N",
                            "requestPublicNote": "",
                            "canUpdateVisibility": "Y",
                            "displayName": "S414R - dalbertson-S414R - Human Pan Cancer Pathways - Daniel Albertson Nov 9, 2015",
                            "label": "S414R - dalbertson-S414R - Human Pan Cancer Pathways - Daniel Albertson Nov 9, 2015"
                        },
                        {
                            "idRequest": "29085",
                            "requestNumber": "S410R",
                            "requestCreateDate": "20151103",
                            "requestCreateDateDisplay": "2015-11-03",
                            "requestCreateDateDisplayMedium": "Nov 3, 2015",
                            "createDate": "11/03/2015",
                            "idSlideProduct": "0",
                            "idLab": "1449",
                            "idAppUser": "2252",
                            "codeRequestCategory": "NANO",
                            "icon": "assets/nano.png",
                            "codeApplication": "NANHPCP",
                            "labName": "Dan Albertson Lab",
                            "slideProductName": "",
                            "projectLabName": "Dan Albertson Lab",
                            "projectName": "Experiments for Daniel Albertson",
                            "codeVisibility": "MEM",
                            "ownerFirstName": "Daniel",
                            "ownerLastName": "Albertson",
                            "isExternal": "N",
                            "name": "dalbertson-S410R",
                            "isDirty": "N",
                            "isSelected": "N",
                            "analysisNames": "",
                            "idInstitution": "",
                            "hasQcWorkItems": "N",
                            "idSubmitter": "2252",
                            "hasMultipleAccounts": "N",
                            "canOpenNewBillingTemplate": "N",
                            "requestPublicNote": "",
                            "canUpdateVisibility": "Y",
                            "displayName": "S410R - dalbertson-S410R - Human Pan Cancer Pathways - Daniel Albertson Nov 3, 2015",
                            "label": "S410R - dalbertson-S410R - Human Pan Cancer Pathways - Daniel Albertson Nov 3, 2015"
                        },
                        {
                            "idRequest": "29084",
                            "requestNumber": "S409R2",
                            "requestCreateDate": "20151103",
                            "requestCreateDateDisplay": "2015-11-03",
                            "requestCreateDateDisplayMedium": "Nov 3, 2015",
                            "createDate": "11/03/2015",
                            "idSlideProduct": "0",
                            "idLab": "1449",
                            "idAppUser": "2252",
                            "codeRequestCategory": "ISOL",
                            "icon": "assets/DNA_test_tube.png",
                            "codeApplication": "",
                            "labName": "Dan Albertson Lab",
                            "slideProductName": "",
                            "projectLabName": "Dan Albertson Lab",
                            "projectName": "Experiments for Daniel Albertson",
                            "codeVisibility": "MEM",
                            "ownerFirstName": "Daniel",
                            "ownerLastName": "Albertson",
                            "isExternal": "N",
                            "name": "dalbertson-S409R",
                            "isDirty": "N",
                            "isSelected": "N",
                            "analysisNames": "",
                            "idInstitution": "",
                            "hasQcWorkItems": "N",
                            "idSubmitter": "2252",
                            "hasMultipleAccounts": "N",
                            "canOpenNewBillingTemplate": "N",
                            "requestPublicNote": "",
                            "canUpdateVisibility": "Y",
                            "displayName": "S409R2 - dalbertson-S409R - Daniel Albertson Nov 3, 2015",
                            "label": "S409R2 - dalbertson-S409R - Daniel Albertson Nov 3, 2015"
                        }
                    ]
                }
            }

        ]
        this.emitProjectRequestList();

    }
}

describe('Browse Experiment Component...', () => {
    var mockExperimentService;
    var browseExperimentsComponent:BrowseExperimentsComponent;
    var fixture: ComponentFixture<BrowseExperimentsComponent>;
    var spy: any;
    var timerCallback: any;

    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL=5000;
        }
    )

    beforeEach(done => {
        console.log("in before each");

        TestBed.configureTestingModule({
            imports: [FormsModule, HttpModule, TreeModule.forRoot(),
                UtilModule, RouterTestingModule, AngularMaterialModule, AngularSplitModule],
            declarations: [BrowseExperimentsComponent, BrowsePanelComponent],
            providers: [{provide: ExperimentsService, useClass: MockExperimentService},
                {provide: LabListService, useClass: LabListService},
                {provide: DialogsService, useClass: DialogsService},
                {provide: CookieUtilService, useClass: CookieUtilService},
                {provide: CookieService, useClass: CookieService},
                {provide: ConstantsService, useClass: ConstantsService},
                {provide: ProgressService, useClass: ProgressService},
                {provide: BillingService, useClass: BillingService},
                {provide: LaunchPropertiesService, useClass: LaunchPropertiesService},
                {provide: DictionaryService, useClass: DictionaryService},
                {provide: AnalysisService, useClass: AnalysisService},
                {provide: DataTrackService, useClass: DataTrackService},
                {provide: GetLabService, useClass: GetLabService},
                {provide: AppUserListService, useClass: MockAppUserListService},
                {provide: CreateSecurityAdvisorService, useClass: MockCreateSecurityAdvisorService}
            ]
        });
        fixture = TestBed.createComponent(BrowseExperimentsComponent);
        // browseExperimentsComponent = fixture.componentInstance;
        //
        // browseExperimentsComponent.experimentService.getProjectRequestList_fromBackend(new URLSearchParams());
        done();

        console.log("end of beforeEach");
    });

    it('Should recognize the tree', () => {
        TestBed.compileComponents().then(() => {

            var browseExperimentComponent = fixture.componentInstance;
            browseExperimentComponent.experimentsService.getProjectRequestList_fromBackend(new URLSearchParams());


            fixture.whenStable().then(() => {
                var tree: TreeComponent = browseExperimentComponent.treeComponent;
                fixture.detectChanges();

                var node: TreeNode = tree.treeModel.getFirstRoot();
                node.expand();
                expect(tree).toBeDefined();
                //done();
            });
        });
        console.log("end recognize test");
    });

    it('Should have the first root node expanded.', () => {
        TestBed.compileComponents().then(() => {

            var browseExperimentComponent = fixture.componentInstance;
            browseExperimentComponent.experimentsService.getProjectRequestList_fromBackend(new URLSearchParams());


            fixture.whenStable().then(() => {
                var tree: TreeComponent = browseExperimentComponent.treeComponent;
                fixture.detectChanges();

                var node: TreeNode = tree.treeModel.getFirstRoot();

                node.expand();
                console.log("expanded " + node.isExpanded);
                expect(node.isExpanded).toBeTruthy();
                //done();
            });
        });
    });

    it('Should have Jay Agarwal Lab as first root and expandCollapseClicked called. ', () => {

        TestBed.compileComponents().then ( () => {
            var browseExperimentComponent = fixture.componentInstance;
            browseExperimentComponent.experimentsService.getProjectRequestList_fromBackend(new URLSearchParams());

            var tree: TreeComponent = browseExperimentComponent.treeComponent;
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                var firstNode:TreeNode = tree.treeModel.getFirstRoot();
                expect(firstNode.displayField).toBe("Jay Agarwal Lab");
            });
        });
    });

    it('Should have 2 root nodes ', () => {
        TestBed.compileComponents().then(() => {
            var browseExperimentComponent = fixture.componentInstance;
            browseExperimentComponent.experimentsService.getProjectRequestList_fromBackend(new URLSearchParams());

            var tree: TreeComponent = browseExperimentComponent.treeComponent;
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                var nodes:Number = tree.treeModel.nodes.length;
                expect(nodes).toBe(2);
            });
        });
    });
});




