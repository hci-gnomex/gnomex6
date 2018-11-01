import {DictionaryFilter} from "./dictionary-filter.interface";

export interface Dictionary {
    DictionaryEntry?: any;
    Filters: DictionaryFilter[];
    canWrite: string;
    className: string;
    displayName: string;
}