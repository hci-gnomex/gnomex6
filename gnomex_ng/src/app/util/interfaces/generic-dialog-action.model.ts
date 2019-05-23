export enum ActionType {
    PRIMARY = "primary",
    SECONDARY = "accent"
}
export interface GDActionConfig {
    actions:GDAction[]
}
export interface GDAction{
    type: ActionType,
    internalAction?:string,
    externalAction?:()=>void,
    icon?:string,
    name: string

}