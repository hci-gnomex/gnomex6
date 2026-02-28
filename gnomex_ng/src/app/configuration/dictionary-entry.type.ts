import {AnyProperty} from "./any-property.interface";

export type DictionaryEntry = AnyProperty & {
    canDelete: string;
    canRead: string;
    canUpdate: string;
    canWrite: string;
    display: string;
    value: string;
    datakey: string;
}