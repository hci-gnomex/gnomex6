import {DictionaryFilter} from "./dictionary-filter.interface";

export interface Dictionary {
    DictionaryEntry?: any;
    Filters?: DictionaryFilter[];
    Field?: any[];
    canWrite: string;
    className: string;
    displayName: string;

    // Used by dictionary editor component
    display?: string;
    icon?: string;
}