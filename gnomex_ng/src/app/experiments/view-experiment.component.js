var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by u6008750 on 5/12/2017.
 */
import 'rxjs/add/operator/switchMap';
import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { ExperimentsService } from "./experiments.service";
var ViewExperimentComponent = (function () {
    function ViewExperimentComponent(experimentsService, route) {
        this.experimentsService = experimentsService;
        this.route = route;
    }
    // ngOnInit(): void {
    //     this.experimentsService
    //         .getExperiment(this.route.snapshot.paramMap.get('id'))
    //         .subscribe((response:any) => {
    //             this.experiment = response.Request;
    //             console.log("in init "+this.experiment.number);
    //         })
    //
    // }
    // ngOnInit(): void {
    //     this.route.params
    //         .switchMap((params: Params) => this.experimentsService.getExperiment(params['id']))
    //         .subscribe((response: Object) => {
    //             this.experiment = response;
    //             console.log("in experiment");
    //         })
    // }
    //
    ViewExperimentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.experimentsService
            .getExperiment(this.route.snapshot.paramMap.get('id'))
            .subscribe(function (response) {
            _this.experiment = response.Request;
            console.log("in init " + _this.experiment.number);
        });
    };
    return ViewExperimentComponent;
}());
ViewExperimentComponent = __decorate([
    Component({
        selector: "experiment",
        template: "\n        <div *ngIf=\"experiment\" class=\"container-fluid\" style=\"padding-top: 10px\">\n        \n            <div class=\"row\">\n                    <table class=\"table\">\n                        <tbody>\n                            <tr>\n                                <td width=\"15%\">Name</td>\n                                <td width=\"30%\">{{this.experiment.name}}</td>\n                                <td width=\"15%\">Number</td>\n                                <td width=\"30%\">{{experiment.number}}</td>\n                            </tr>\n                            <tr>\n                                <td width=\"15%\">Experiment</td>\n                                <td width=\"30%\">{{experiment.project}}</td>\n                                <td width=\"15%\">Email</td>\n                                <td width=\"30%\">{{experiment.requestor}}</td>\n                            </tr>\n                        </tbody>\n                    </table>\n            </div> <!-- end row -->\n        \n        \n        </div> <!--  end container -->\n    "
    }),
    __metadata("design:paramtypes", [ExperimentsService,
        ActivatedRoute])
], ViewExperimentComponent);
export { ViewExperimentComponent };
//# sourceMappingURL=view-experiment.component.js.map