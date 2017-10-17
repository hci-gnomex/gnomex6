var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, OpaqueToken } from "@angular/core";
import { Http, URLSearchParams } from "@angular/http";
import { Subject } from "rxjs/Subject";
export var BROWSE_EXPERIMENTS_ENDPOINT = new OpaqueToken("browse_experiments_url");
export var VIEW_EXPERIMENT_ENDPOINT = new OpaqueToken("view_experiment_url");
var ExperimentsService = (function () {
    function ExperimentsService(_http, _browseExperimentsUrl) {
        this._http = _http;
        this._browseExperimentsUrl = _browseExperimentsUrl;
        this.experimentOrdersSubject = new Subject();
        this.changeStatusSubject = new Subject();
        this.haveLoadedExperimentOrders = false;
        this.previousURLParams = null;
    }
    ExperimentsService.prototype.getExperiments = function () {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?idLab=1500&showCategory='N'", {withCredentials: true}).map((response: Response) => {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?showEmptyProjectFolders=N&allExperiments=Y&showSamples=N&showCategory=N", {withCredentials: true}).map((response: Response) => {
        return this._http.get("/gnomex/GetProjectRequestList.gx?showEmptyProjectFolders=N&allExperiments=Y&showSamples=N&showCategory=N&idCoreFacility=3&showEmptyProjectFolders=N", { withCredentials: true }).map(function (response) {
            if (response.status === 200) {
                return response.json().Lab;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.getExperimentsObservable = function () {
        return this.experimentOrdersSubject.asObservable();
    };
    ExperimentsService.prototype.getExperiments_fromBackend = function (parameters) {
        var _this = this;
        if (this.haveLoadedExperimentOrders && this.previousURLParams === parameters) {
            // do nothing
            console.log("Experiment Orders already loaded");
        }
        else {
            this.haveLoadedExperimentOrders = true;
            this.previousURLParams = parameters;
            this._http.get("/gnomex/GetRequestList.gx", { withCredentials: true, search: parameters }).subscribe(function (response) {
                // console.log("GetRequestList called");
                if (response.status === 200) {
                    _this.experimentOrders = response.json().Request;
                    _this.emitExperimentOrders();
                }
                else {
                    throw new Error("Error");
                }
            });
        }
    };
    ExperimentsService.prototype.repeatGetExperiments_fromBackend = function () {
        this.haveLoadedExperimentOrders = false;
        this.getExperiments_fromBackend(this.previousURLParams);
    };
    ExperimentsService.prototype.getChangeExperimentStatusObservable = function () {
        return this.changeStatusSubject.asObservable();
    };
    ExperimentsService.prototype.changeExperimentStatus = function (idRequest, codeRequestStatus) {
        var _this = this;
        var parameters = new URLSearchParams;
        parameters.set("idRequest", idRequest);
        parameters.set("codeRequestStatus", codeRequestStatus);
        // console.log("Changing Experiment numbers: " + parameters.get("idRequest") + " status to " + parameters.get("codeRequestStatus"));
        this._http.get("/gnomex/ChangeRequestStatus.gx", { withCredentials: true, search: parameters }).subscribe(function (response) {
            if (response.status === 200) {
                _this.changeStatusSubject.next(response.json());
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.emitExperimentOrders = function () {
        this.experimentOrdersSubject.next(this.experimentOrders);
    };
    // refreshExperimentOrders(): void {
    // 	this._http.get("/gnomex/GetRequestList.gx", {withCredentials: true}).map((response: Response) => {
    // 		if (response.status === 200) {
    // 			this.experimentOrders2.next({requests: response.json().Request});
    // 		} else {
    // 			throw new Error("Error");
    // 		}
    // 	});
    // }
    ExperimentsService.prototype.getExperiment = function (id) {
        return this._http.get("/gnomex/GetRequest.gx?requestNumber=" + id, { withCredentials: true }).map(function (response) {
            if (response.status === 200) {
                return response.json();
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.getLab = function (params) {
        return this._http.get("/gnomex/GetLab.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                return response.json().Lab;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.saveRequestProject = function (params) {
        return this._http.get("/gnomex/SaveRequestProject.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                return response;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.getProject = function (params) {
        return this._http.get("/gnomex/GetProject.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                console.log("&&&&&&&&&&&&&&&&&& getProject " + response);
                return response.json();
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.saveProject = function (params) {
        return this._http.get("/gnomex/SaveProject.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                return response;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.deleteProject = function (params) {
        return this._http.get("/gnomex/DeleteProject.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                return response;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.getProjectRequestList = function (params) {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?idLab=1500&showCategory='N'", {withCredentials: true}).map((response: Response) => {
        return this._http.get("/gnomex/GetProjectRequestList.gx", { search: params, withCredentials: true }).map(function (response) {
            if (response.status === 200) {
                return response.json().Lab;
            }
            else {
                throw new Error("Error");
            }
        });
    };
    ExperimentsService.prototype.getRequestList = function (params) {
        return this._http.get("/gnomex/GetRequestList.gx", { search: params }).map(function (response) {
            if (response.status === 200) {
                return response.json();
            }
            else {
                throw new Error("Error");
            }
        });
    };
    return ExperimentsService;
}());
ExperimentsService = __decorate([
    Injectable(),
    __param(1, Inject(BROWSE_EXPERIMENTS_ENDPOINT)),
    __metadata("design:paramtypes", [Http, String])
], ExperimentsService);
export { ExperimentsService };
//# sourceMappingURL=experiments.service.js.map