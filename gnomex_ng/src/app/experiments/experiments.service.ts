import {Inject, Injectable, OpaqueToken} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
//import {Observer} from "rxjs/Observer";

export let BROWSE_EXPERIMENTS_ENDPOINT: OpaqueToken = new OpaqueToken("browse_experiments_url");
export let VIEW_EXPERIMENT_ENDPOINT: OpaqueToken = new OpaqueToken("view_experiment_url");

@Injectable()
export class ExperimentsService {

	private experimentOrders: any[];
    private projectRequestList: any[];
    public selectedTreeNode:any;

    private experimentOrdersSubject: Subject<any[]> = new Subject();
    private projectRequestListSubject: Subject<any[]> = new Subject();
    private projectSubject:Subject<any> = new Subject();

    private haveLoadedExperimentOrders: boolean = false;
    private previousURLParams: URLSearchParams = null;
    private changeStatusSubject: Subject<any> = new Subject();
    private requestProgressList: BehaviorSubject<any>= new BehaviorSubject([]);
    private requestProgressDNASeqList: BehaviorSubject<any> = new BehaviorSubject([]);
    private requestProgressSolexaList:BehaviorSubject<any> = new BehaviorSubject([]);

    private experimentOverviewListSubject:BehaviorSubject<any> = new BehaviorSubject([]);
    private filteredExperimentOverviewListSubject:Subject<any> = new Subject();

    // conditional params
    browsePanelParams:URLSearchParams;
    experimentList:Array<any> =[];
    constructor(private _http: Http, @Inject(BROWSE_EXPERIMENTS_ENDPOINT) private _browseExperimentsUrl: string) {}

    getExperiments() {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?idLab=1500&showCategory='N'", {withCredentials: true}).map((response: Response) => {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?showEmptyProjectFolders=N&allExperiments=Y&showSamples=N&showCategory=N", {withCredentials: true}).map((response: Response) => {

        return this._http.get("/gnomex/GetProjectRequestList.gx?showEmptyProjectFolders=N&allExperiments=Y&showSamples=N&showCategory=N&idCoreFacility=3&showEmptyProjectFolders=N", {withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json().Lab;
            } else {
                throw new Error("Error");
            }
        });
    }

	getExperimentsObservable(): Observable<any> {
		return this.experimentOrdersSubject.asObservable();
	}

    refreshProjectRequestList_fromBackend(): void {
        this._http.get("/gnomex/GetProjectRequestList.gx", {
            withCredentials: true,
            search: this.previousURLParams
        }).subscribe((response: Response) => {
            console.log("GetRequestList called");

            if (response.status === 200) {
                this.projectRequestList = response.json().Lab;
                this.emitProjectRequestList();
                //return response.json().Request;
            } else {
                throw new Error("Error");
            }
        });
    }


    getExperiments_fromBackend(parameters: URLSearchParams): void {
		if (this.haveLoadedExperimentOrders && this.previousURLParams === parameters) {
			// do nothing
			console.log("Experiment Orders already loaded");
			// return Observable.of(this.experimentOrders);
		} else {
			this.haveLoadedExperimentOrders = true;
			this.previousURLParams = parameters;

			this._http.get("/gnomex/GetRequestList.gx", {withCredentials: true, search: parameters}).subscribe((response: Response) => {
				// console.log("GetRequestList called");

				if (response.status === 200) {
					this.experimentOrders = response.json().Request;
					this.emitExperimentOrders();
					//return response.json().Request;
				} else {
					throw new Error("Error");
				}
			});
		}
	}

	repeatGetExperiments_fromBackend(): void {
    this.haveLoadedExperimentOrders = false;
    this.getExperiments_fromBackend(this.previousURLParams);
  }

	getChangeExperimentStatusObservable(): Observable<any> {
		return this.changeStatusSubject.asObservable();
	}

	changeExperimentStatus(idRequest: string, codeRequestStatus: string): void {

		let parameters: URLSearchParams = new URLSearchParams;
		parameters.set("idRequest", idRequest);
		parameters.set("codeRequestStatus", codeRequestStatus);

		// console.log("Changing Experiment numbers: " + parameters.get("idRequest") + " status to " + parameters.get("codeRequestStatus"));

		this._http.get("/gnomex/ChangeRequestStatus.gx", {withCredentials: true, search: parameters}).subscribe((response: Response) => {
			if (response.status === 200) {
				this.changeStatusSubject.next(response.json());
				//return response.json().Request;
			} else {
				throw new Error("Error");
			}
		});
	}


    emitExperimentOrders(): void {
        this.experimentOrdersSubject.next(this.experimentOrders);
    }

    getProjectRequestListObservable(): Observable<any> {
        return this.projectRequestListSubject.asObservable();
    }


    emitProjectRequestList(): void {
        this.projectRequestListSubject.next(this.projectRequestList);
    }

    getProjectRequestList_fromBackend(params: URLSearchParams): void {
        if (this.haveLoadedExperimentOrders && this.previousURLParams === params) {
            // do nothing
            console.log("Experiment Orders already loaded");
            // return Observable.of(this.experimentOrders);
        } else {
            this.haveLoadedExperimentOrders = true;
            this.previousURLParams = params;

            this._http.get("/gnomex/GetProjectRequestList.gx", {
                withCredentials: true,
                search: params
            }).subscribe((response: Response) => {
                console.log("GetRequestList called");

                if (response.status === 200) {
                    this.projectRequestList = response.json().Lab;
                    this.emitProjectRequestList();
                    //return response.json().Request;
                } else {
                    throw new Error("Error");
                }
            });
        }
    }

        getExperiment(id: string): Observable<any> {
        return this._http.get("/gnomex/GetRequest.gx?idRequest=" + id, {withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getLab(params: URLSearchParams): Observable<any> {
        return this._http.get("/gnomex/GetLab.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json().Lab;
            } else {
                throw new Error("Error");
            }
        });

    }

    saveRequestProject(params: URLSearchParams):  Observable<any> {
        return this._http.get("/gnomex/SaveRequestProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }


    getProjectObsevable():Observable<any>{
        return this.projectSubject.asObservable();
    }
    emitProject(project:any):void{
        this.projectSubject.next(project);
    }
    getProject_fromBackend(params: URLSearchParams): void {
            this._http.get("/gnomex/GetProject.gx",{search: params})
                .subscribe((response: Response) => {
                console.log("getProject called");
                if (response.status === 200) {
                    let project = response.json();
                    this.emitProject(project);
                    //return response.json().Request;
                } else {
                    throw new Error("Error getting Project");
                }
            });
    }



    getProject(params: URLSearchParams):  Observable<any> {
        return this._http.get("/gnomex/GetProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                console.log("&&&&&&&&&&&&&&&&&& getProject " + response);
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    saveProject(params: URLSearchParams):  Observable<any> {
        return this._http.get("/gnomex/SaveProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    deleteExperiment(params: URLSearchParams):  Observable<any> {
        return this._http.get("/gnomex/DeleteRequest.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });
    }


    getProjectRequestList(params: URLSearchParams) {
        //return this._http.get("/gnomex/GetProjectRequestList.gx?idLab=1500&showCategory='N'", {withCredentials: true}).map((response: Response) => {
        return this._http.get("/gnomex/GetProjectRequestList.gx", {search: params, withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json().Lab;
            } else {
                throw new Error("Error");
            }
        });
    }

    getRequestList(params: URLSearchParams): Observable<any> {
        return this._http.get("/gnomex/GetRequestList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }


    getRequestProgressListObservable():Observable<any>{
        return this.requestProgressList;
    }
    getRequestProgressList_FromBackend(params:URLSearchParams):void{
        this._http.get("/gnomex/GetRequestProgressList.gx",{search:params})
            .subscribe((response: Response)=> {
                if (response.status === 200){
                    this.requestProgressList.next(response.json());
                }else{
                    throw new Error("Error");
                }
            });
    }

    getRequestProgressSolexaListObservable():Observable<any>{
       return this.requestProgressSolexaList.asObservable();
    }
    getRequestProgressSolexaList_FromBackend(params: URLSearchParams):void{
        this._http.get("/gnomex/GetRequestProgressSolexaList.gx",{search:params})
            .subscribe((response: Response)=> {
                if (response.status === 200){
                    this.requestProgressSolexaList.next(response.json());
                }else{
                    throw new Error("Error");
                }
            });

    }

    getRequestProgressDNASeqListObservable(){
        return this.requestProgressDNASeqList.asObservable();
    }
    getRequestProgressDNASeqList_FromBackend(params: URLSearchParams):void{
        this._http.get("/gnomex/GetRequestProgressDNASeqList.gx",{search:params})
            .subscribe((response: Response)=> {
            if (response.status === 200){
                this.requestProgressDNASeqList.next(response.json());
            }else{
                throw new Error("Error");
            }
        });
    }
    emitExperimentOverviewList(data:any):void{
        this.experimentOverviewListSubject.next(data);
    }
    resetExperimentOverviewListSubject(){
        this.experimentOverviewListSubject = new BehaviorSubject([]);
    }
    getExperimentOverviewListSubject():BehaviorSubject<any>{
        return this.experimentOverviewListSubject;
    }
    emitFilteredOverviewList(data:any):void{
        this.filteredExperimentOverviewListSubject.next(data);
    }
    getFilteredOverviewListObservable():Observable<any>{
        return this.filteredExperimentOverviewListSubject.asObservable();
    }



}
