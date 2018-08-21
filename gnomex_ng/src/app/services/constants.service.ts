import {Injectable} from "@angular/core";

@Injectable()
export class ConstantsService {
    public readonly ICON_CHECKED = "assets/tick.png";
    public readonly SEGMENGT_NEW = "assets/segment_new.png";
    public readonly SEGMENGT_REMOVE = "assets/segment_remove.png";
    public readonly SEGMENGT_NEW_DISABLE = "assets/segment_new_disable.png";
    public readonly SEGMENGT_REMOVE_DISABLE = "assets/segment_remove_disable.png";
    public readonly SEGMENGT_IMPORT = "assets/segment_import.png";
    public readonly SEGMENGT_IMPORT_DISABLE = "assets/segment_remove_disable.png";
    public readonly PAGE_ADD = "assets/page_add.png";
    public readonly PAGE_REMOVE = "assets/page_remove.png";
    public readonly PAGE_REMOVE_DISABLE = "assets/page_remove_disable.png";
    public readonly PAGE_NEW = "assets/page_new.png";
    public readonly PAGE_NEW_DISABLE = "assets/page_new_disable.png";
    public readonly X_XSRF_TOKEN_COOKIE_NAME: string = "XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_HEADER: string = "X-XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_SESSION_KEY: string = "X-XSRF-SESSION-TOKEN";
    public readonly X_XSRF_TOKEN_PARAM_KEY: string = "xsrfToken";
    public static readonly CODE_PRODUCT_ORDER_STATUS_NEW: string = "NEW";
    public readonly RESERVED_SAMPLE_SHEET_COL_NAMES: string[] = [
        "Multiplex #",
        "Plate",
        "ID",
        "Well",
        "Ctrl?",
        "Sample Name",
        "Source Plate",
        "Source Well",
        "Dest. Well",
        "Reaction Plates",
        "Redo",
        "Conc.",
        "Unit",
        "Description",
        "CC Number",
        "Index Tag",
        "Sample Type",
        "Organism",
        "Organism (other)",
        "Core to prep lib?",
        "Nucl. acid extraction meth.",
        "Chip Type",
        "QC Conc. ng/uL",
        "QC 260/230",
        "QC RIN",
        "QC Bioanalyzer method",
        "QC Frag Size (from)",
        "QC Frag Size (to)",
        "QC Status",
        "Seq Lib Protocol",
        "Seq Lib QC Bioanalyzer method",
        "Seq Lib Conc. ng/uL",
        "Seq Lib Prep Status",
    ];

    public readonly DEFAULT_TOOLBAR_SETTINGS: string = "bold italic underline | left center right |  format font size |" +
        " color | ul ol | outdent indent";

    public readonly GLOBE_LINK: string = "assets/globe_link.png";
    public readonly EMAIL_GO_LINK: string = "assets/email_go.png";
    public readonly ICON_UCSC: string = "assets/ucscFavicon.png";
    public readonly ICON_IGV: string = "assets/igv.png";
    public readonly ICON_IOBIO: string = "assets/iobio.png";
    public readonly ICON_LINK: string = "assets/icon_link.gif";
    public readonly ICON_DELETE_LINK: string = "assets/link_delete.png";
    public readonly ICON_DOWNLOAD: string = "assets/download.png";

    public readonly ICON_ANALYSIS:string = "assets/map.png";
    public readonly ICON_TOPIC:string = "assets/topic_tag.png";
    public readonly ICON_TOPIC_PUBLIC:string = "assets/topic_tag_public.png";
    public readonly ICON_TOPIC_MEMBER:string = "assets/topic_tag_members.png";
    public readonly ICON_TOPIC_INSTITUTION:string = "assets/topic_tag_institution.png";
    public readonly ICON_TOPIC_OWNER:string = "assets/topic_tag_owner.png";

    public readonly ICON_DATATRACK:string = "assets/datatrack.png";
    public readonly ICON_DATATRACK_PUBLIC:string = "assets/datatrack_world.png";
    public readonly ICON_DATATRACK_MEMBER:string = "assets/datatrack_member.png";
    public readonly ICON_DATATRACK_MEMBERCOLLAB:string = "assets/datatrack_member.png";
    public readonly ICON_DATATRACK_INSTITUTION:string = "assets/datatrack_institution.png";
    public readonly ICON_DATATRACK_OWNER:string = "assets/datatrack_owner.png" ;

    public readonly ICON_GREEN_BULLET:string = "assets/bullet_green.png";
    public readonly ICON_FOLDER:string = "assets/folder.png";
    public readonly ICON_FLASK:string = "assets/flask.png";

    public readonly ICON_DELETE:string = "assets/delete.png";
    public readonly ICON_FOLDER_DELETE:string= "assets/folder_delete.png";

    public readonly ICON_INFORMATION:string= "assets/information.png";
    public readonly ICON_UPLOAD:string= "assets/upload.png";



    public getTreeIcon(item:any,name:string) {

        if (name === "DataTrack") {
             this.getDataTrackIcon(item,name);
        }else if(name === "Analysis" ){
            item.icon = this.ICON_ANALYSIS;
        }
        else if (name === "Topic") {
            if (item.codeVisibility === "MEM") {
                item.icon = this.ICON_TOPIC_MEMBER;
            } else if (item.codeVisibility === "MEMCOL") {
                item.icon = this.ICON_TOPIC_MEMBER;
            } else if (item.codeVisibility === "OWNER") {
                item.icon = this.ICON_ANALYSIS;
            } else if (item.codeVisibility === "INST") {
                item.icon = this.ICON_TOPIC_INSTITUTION;
            } else {
                item.icon = this.ICON_TOPIC_PUBLIC;
            }
        }
        else if(name === "SequenceLane"){
            item.icon = this.ICON_GREEN_BULLET;
        }
        else if(name === "Request"){
            item.icon = this.ICON_FLASK;
        }

    }






    private getDataTrackIcon(item:any,name:string):void {

        if (item.codeVisibility === "MEM") {
            item.icon = this.ICON_DATATRACK_MEMBER;
        } else if (item.codeVisibility === "MEMCOL") {
            item.icon = this.ICON_DATATRACK_MEMBERCOLLAB;
        } else if (item.codeVisibility === "OWNER") {
            item.icon = this.ICON_DATATRACK_OWNER;
        } else if (item.codeVisibility === "INST") {
            item.icon = this.ICON_DATATRACK_INSTITUTION;
        } else if (item.codeVisibillty === "PUBLIC") {
            item.icon = this.ICON_DATATRACK_PUBLIC;
        }else {
            item.icon = this.ICON_DATATRACK;
        }

    }







}
