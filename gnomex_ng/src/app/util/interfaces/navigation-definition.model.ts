import {HttpErrorResponse} from "@angular/common/http";
import {NavigationExtras} from "@angular/router";
import {ActionType} from "./generic-dialog-action.model";

export interface INavigationDefinition extends HttpErrorResponse {
    optionalParams:NavigationExtras
    requiredParams: IRequiredParam[];
}

export interface IRequiredParam{
    [key:string]: string;

}