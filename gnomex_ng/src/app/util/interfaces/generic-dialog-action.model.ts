
export interface GDActionConfig {
    actions:GDAction[]
}
export interface GDAction{
    internalAction?:string,
    externalAction?:()=>void,
    icon?:string,
    name: string
}