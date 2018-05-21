import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class AdvancedSearchService implements OnDestroy {

    private readonly ALL_OBJECT_SEARCH_LIST_ATTRIBUTE: string = 'AllObjectsSearchList';
    private readonly EXPERIMENT_SEARCH_LIST_ATTRIBUTE: string = 'ExperimentSearchList';
    private readonly ANALYSIS_SEARCH_LIST_ATTRIBUTE:   string = 'AnalysisSearchList';
    private readonly PROTOCOL_SEARCH_LIST_ATTRIBUTE:   string = 'ProtocolSearchList';
    private readonly DATA_TRACK_SEARCH_LIST_ATTRIBUTE: string = 'DataTrackSearchList';
    private readonly TOPIC_SEARCH_LIST_ATTRIBUTE:      string = 'TopicSearchList';

    private readonly DICTIONARY_MAP_ATTRIBUTE: string = 'DictionaryMap';


    private isAwaitingGetSearchMetaInformationResponse: boolean = false;


    private _getSearchMetaInformationSubscription: Subscription;

    private _allObjectSearchListSubscription:  Subscription;
    private _experimentSearchListSubscription: Subscription;
    private _analysisSearchListSubscription:   Subscription;
    private _protocolSearchListSubscription:   Subscription;
    private _dataTrackSearchListSubscription:  Subscription;
    private _topicSearchListSubscription:      Subscription;

    private _dictionaryMapSubscription: Subscription;


    private _getSearchMetaInformationSubject:  BehaviorSubject<any> = new BehaviorSubject({});

    /* These could be replaced, but are included as data-provider */
    private _allObjectSearchListSubject:  BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _experimentSearchListSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _analysisSearchListSubject:   BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _protocolSearchListSubject:   BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _dataTrackSearchListSubject:  BehaviorSubject<any[]> = new BehaviorSubject([]);
    private _topicSearchListSubject:      BehaviorSubject<any[]> = new BehaviorSubject([]);

    private _dictionaryMapSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);



    constructor(private httpClient: HttpClient) { }

    ngOnDestroy(): void {
        this._allObjectSearchListSubscription.unsubscribe();
        this._experimentSearchListSubscription.unsubscribe();
        this._analysisSearchListSubscription.unsubscribe();
        this._protocolSearchListSubscription.unsubscribe();
        this._dataTrackSearchListSubscription.unsubscribe();
        this._topicSearchListSubscription.unsubscribe();
        this._dictionaryMapSubscription.unsubscribe();
    }

    getAllObjectSearchListObservable(): Observable<any[]> {
        this.getAllObjectSearchList();
        return this._allObjectSearchListSubject.asObservable();
    }
    getExperimentSearchListObservable(): Observable<any[]> {
        this.getExperimentSearchList();
        return this._experimentSearchListSubject.asObservable();
    }
    getAnalysisSearchListObservable(): Observable<any[]> {
        this.getAnalysisSearchList();
        return this._analysisSearchListSubject.asObservable();
    }
    getProtocolSearchListObservable(): Observable<any[]> {
        this.getProtocolSearchList();
        return this._protocolSearchListSubject.asObservable();
    }
    getDataTrackSearchListObservable(): Observable<any[]> {
        this.getDataTrackSearchList();
        return this._dataTrackSearchListSubject.asObservable();
    }
    getTopicSearchListObservable(): Observable<any[]> {
        this.getTopicSearchList();
        return this._topicSearchListSubject.asObservable();
    }

    getDictionaryMapObservable(): Observable<any[]> {
        this.getDictionaryMap();
        return this._dictionaryMapSubject.asObservable();
    }

    private getAllObjectSearchList(): void {
        if (!this._allObjectSearchListSubscription) {
            this._allObjectSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.ALL_OBJECT_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._allObjectSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getExperimentSearchList(): void {
        if (!this._experimentSearchListSubscription) {
            this._experimentSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.EXPERIMENT_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._experimentSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getAnalysisSearchList(): void {
        if (!this._analysisSearchListSubscription) {
            this._analysisSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.ANALYSIS_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._analysisSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getProtocolSearchList(): void {
        if (!this._protocolSearchListSubscription) {
            this._protocolSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.PROTOCOL_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._protocolSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getDataTrackSearchList(): void {
        if (!this._dataTrackSearchListSubscription) {
            this._dataTrackSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.DATA_TRACK_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._dataTrackSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getTopicSearchList(): void {
        if (!this._topicSearchListSubscription) {
            this._topicSearchListSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.TOPIC_SEARCH_LIST_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._topicSearchListSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }

    private getDictionaryMap(): void {
        if (!this._dictionaryMapSubscription) {
            this._dictionaryMapSubscription = this._getSearchMetaInformationSubject.subscribe((response) => {

                let mustBeArray = response[this.DICTIONARY_MAP_ATTRIBUTE];
                if (mustBeArray && !Array.isArray(mustBeArray)) {
                    mustBeArray = [mustBeArray];
                }

                this._dictionaryMapSubject.next(mustBeArray);
            });
        }

        this.getGetSearchMetaInformation();
    }


    private getGetSearchMetaInformation(): void {
        if (!this.isAwaitingGetSearchMetaInformationResponse) {
            this.isAwaitingGetSearchMetaInformationResponse = true;

            this._getSearchMetaInformationSubscription = this.httpClient.get('gnomex/GetSearchMetaInformation.gx', {}).subscribe((response) => {
                this._getSearchMetaInformationSubject.next(response);
                this.isAwaitingGetSearchMetaInformationResponse = false;
            }, (error) => {
                console.log("ERROR : " + error);
                this.isAwaitingGetSearchMetaInformationResponse = false;
            });
        }
    }
}