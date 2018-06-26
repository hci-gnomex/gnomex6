

import {IAnnotationOption} from "./annotation-option.model";

export interface IAnnotation {
    codePropertyType: string
    name: string
    idProperty: string
    idPropertyEntry: string
    isRequired: string
    value: string;
    PropertyEntryValue? : IPropertyEntryValue[];

    PropertyOption? : IAnnotationOption[];

}

export interface IPropertyEntryValue {
    idPropertyEntryValue: string,
    urlAlias: string,
    urlDisplay: string ,
    url:string ,
    value: string,
    edit:boolean
}