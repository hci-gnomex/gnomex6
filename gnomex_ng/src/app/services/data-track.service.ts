import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class DataTrackService {
    public datatracksList: any[];
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private datatracksListSubject: Subject<any[]> = new Subject();
    private _haveLoadedDatatracksList: boolean = false;
    private _previousURLParams: URLSearchParams = null;

    constructor(private http: Http) {
    }

    getDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getDataTrackList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetDataTrackList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    saveDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveDataTrackFolder.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    saveDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    unlinkDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/UnlinkDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    duplicateDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DuplicateDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    moveDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveDataTrack.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    moveDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveDataTrackFolder.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteDataTrackFolder.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteGenomeBuild(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteGenomeBuild.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteOrganism(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteOrganism.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    emitDatatracksList(): void {
        this.datatracksListSubject.next(this.datatracksList);
    }

    getDatatracksListObservable(): Observable<any> {
        return this.datatracksListSubject.asObservable();
    }
    getDatatracksList_fromBackend(params: URLSearchParams): void {
        this.startSearchSubject.next(true);
        if (this._haveLoadedDatatracksList && this._previousURLParams === params) {
            // do nothing
        } else {
            this._haveLoadedDatatracksList = true;
            this._previousURLParams = params;

            this.http.get("/gnomex/GetDataTrackList.gx", {
                withCredentials: true,
                search: params
            }).subscribe((response: Response) => {
                console.log("GetRequestList called");

                if (response.status === 200) {
                    this.datatracksList = response.json().Organism;
                    this.emitDatatracksList();
                } else {
                    throw new Error("Error");
                }
            });
        }
    }

    refreshDatatracksList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.http.get("/gnomex/GetDataTrackList.gx", {
            withCredentials: true,
            search: this._previousURLParams
        }).subscribe((response: Response) => {
            console.log("GetDataTrackList called");

            if (response.status === 200) {
                this.datatracksList = response.json().Organism;
                this.emitDatatracksList();
            } else {
                throw new Error("Error");
            }
        });
    }

    saveGenomeBuild(params: URLSearchParams):  Observable<Response> {
        return this.http.get("/gnomex/SaveGenomeBuild.gx", {search: params});
    }

}