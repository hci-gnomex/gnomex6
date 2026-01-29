export interface IRegisterUser {
    result: string,
    CoreFacilities?: ISimpleCoreFacility[],
    Labs?: ISimpleLab[],
    isUniversityUserAuthentication?: string,
    publicDataNotice?: string,
    siteLogo:string
}

export interface ISimpleLab{
    idLab:string,
    name:string
}
export interface ISimpleCoreFacility {
    idCoreFacility: string,
    description: string,
    display:string
}