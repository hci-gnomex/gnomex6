

import {IAnnotationOption} from "./annotation-option.model";

export interface IAnnotation {
    codePropertyType: string
    name: string
    idProperty: string
    idPropertyEntry: string
    isRequired: string
    value: string;

    PropertyOption? : IAnnotationOption[];

}