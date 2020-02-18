import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

import {BehaviorSubject} from "rxjs";
import {Observable} from "rxjs";
import {Subject} from "rxjs";
import {Subscription} from "rxjs";
import {CookieUtilService} from "../../services/cookie-util.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";

@Injectable()
export class AdvancedSearchService implements OnDestroy {

    private readonly ALL_OBJECTS : string = 'ALL_OBJECTS';
    private readonly EXPERIMENTS : string = 'EXPERIMENTS';
    private readonly ANALYSES    : string = 'ANALYSES';
    private readonly PROTOCOLS   : string = 'PROTOCOLS';
    private readonly DATA_TRACKS : string = 'DATA_TRACKS';
    private readonly TOPICS      : string = 'TOPICS';

    private readonly MATCH_ALL_TERMS : string = 'MATCH_ALL_TERMS';
    private readonly MATCH_ANY_TERM  : string = 'MATCH_ANY_TERM';

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

    private _searchResultSubject: Subject<any[]> = new Subject();

    constructor(private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient,
                private dialogService: DialogsService) { }

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

    getSearchResultObservable(): Observable<any[]> {
        return this._searchResultSubject.asObservable();
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

            this._getSearchMetaInformationSubscription = this.httpClient.get('/gnomex/GetSearchMetaInformation.gx', {}).subscribe((response) => {
                this._getSearchMetaInformationSubject.next(response);
                this.isAwaitingGetSearchMetaInformationResponse = false;
            }, (err: IGnomexErrorResponse) => {
                console.error("ERROR : " + err);
                this.isAwaitingGetSearchMetaInformationResponse = false;
            });
        }
    }

    // This search feature is specific to the advanced search, and works off of constants belonging
    // to the AdvancedSearchComponent
    public search(searchType: string, searchText: string, fields: any[], matchingType: string): void {

        let anyFieldHasSearchableValue: boolean = false;
        let isValidRequest: boolean = true;

        let constructingParams: any = {
            text1: '',
            searchPublicProjects: 'Y',
            listKind: "SearchList",

            isAnalysisOnlySearch:   'N',
            isDataTrackOnlySearch:  'N',
            isExperimentOnlySearch: 'N',
            isProtocolOnlySearch:   'N',
            isTopicOnlySearch:      'N',

            matchAllTerms: 'N',
            matchAnyTerm:  'N',

            searchList: ''
        };

        if (searchText && searchText != '') {
            constructingParams.text1 = searchText;
        }

        if (searchType) {
            switch(searchType) {
                case this.ALL_OBJECTS : break;
                case this.ANALYSES    : constructingParams.isAnalysisOnlySearch   = 'Y'; break;
                case this.DATA_TRACKS : constructingParams.isDataTrackOnlySearch  = 'Y'; break;
                case this.EXPERIMENTS : constructingParams.isExperimentOnlySearch = 'Y'; break;
                case this.PROTOCOLS   : constructingParams.isProtocolOnlySearch   = 'Y'; break;
                case this.TOPICS      : constructingParams.isTopicOnlySearch      = 'Y'; break;
                default : isValidRequest = false;
            }
        } else {
            isValidRequest = false;
        }

        if (matchingType) {
            switch(matchingType) {
                case this.MATCH_ALL_TERMS : constructingParams.matchAllTerms = 'Y'; break;
                case this.MATCH_ANY_TERM  : constructingParams.matchAnyTerm  = 'Y'; break;
                default : isValidRequest = false;
            }
        } else {
            isValidRequest = false;
        }

        if (fields && Array.isArray(fields)) {

            let searchStringXML: string = '';

            for (let field of fields) {

                if (field.displayName && field.displayName !== ''
                    && field.searchName && field.searchName !== ''
                    && field.isOptionChoice && field.isOptionChoice !== ''
                    && field.allowMultipleChoice && field.allowMultipleChoice !== '') {

                    searchStringXML += ('<Field displayName="' + field.displayName
                        + '" searchName="' + field.searchName
                        + '" isOptionChoice="' + field.isOptionChoice
                        + '" allowMultipleChoice="' + field.allowMultipleChoice
                        + '" value="' + field.value
                        + '"/>');

                    if (field.value && field.value !== '') {
                        anyFieldHasSearchableValue = true;
                    }
                }
            }

            constructingParams.searchList = searchStringXML;
        }

        if (isValidRequest && (anyFieldHasSearchableValue || constructingParams.text1 !== '')) {
            let finalParams: HttpParams = new HttpParams()
                .set('text1',                  "" + constructingParams.text1)
                .set('searchPublicProjects',   "" + constructingParams.searchPublicProjects)
                .set('listKind',               "" + constructingParams.listKind)
                .set('isAnalysisOnlySearch',   "" + constructingParams.isAnalysisOnlySearch)
                .set('isDataTrackOnlySearch',  "" + constructingParams.isDataTrackOnlySearch)
                .set('isExperimentOnlySearch', "" + constructingParams.isExperimentOnlySearch)
                .set('isProtocolOnlySearch',   "" + constructingParams.isProtocolOnlySearch)
                .set('isTopicOnlySearch',      "" + constructingParams.isTopicOnlySearch)
                .set('matchAllTerms',          "" + constructingParams.matchAllTerms)
                .set('matchAnyTerm',           "" + constructingParams.matchAnyTerm)
                .set('searchList',             "" + constructingParams.searchList);

            let headers: HttpHeaders = new HttpHeaders({
               'Content-Type': 'application/json'
            });

            this.cookieUtilService.formatXSRFCookie();

            this.httpClient.post('/gnomex/SearchIndex.gx', null, { params: finalParams }).subscribe((response: any|any[]) => {
                if (response) {
                    let data = response;

                    if (!Array.isArray(response)) {
                        data = [response];
                    }
                    this._searchResultSubject.next(data);
                }
            });

            // this.httpClient.post('/gnomex/SearchIndex.gx', finalParams).subscribe((response: any|any[]) => {
            //     if (response) {
            //         let data = response;
            //
            //         if (!Array.isArray(response)) {
            //             data = [response];
            //         }
            //         this._searchResultSubject.next(data);
            //     }
            // });
        }
    }
}
