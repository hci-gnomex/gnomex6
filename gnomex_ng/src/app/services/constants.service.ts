import {Injectable} from "@angular/core";

@Injectable()
export class ConstantsService {
    public readonly ICON_CHECKED = "assets/tick.png";
    public readonly SEGMENGT_NEW = "assets/segment_new.png";
    public readonly SEGMENGT_REMOVE = "assets/segment_remove.png";
    public readonly SEGMENGT_NEW_DISABLE = "assets/segment_new_disable.png";
    public readonly SEGMENGT_REMOVE_DISABLE = "assets/segment_remove_disable.png";
    public readonly SEGMENGT_IMPORT ="assets/segment_import.png";
    public readonly SEGMENGT_IMPORT_DISABLE ="assets/segment_remove_disable.png";
    public readonly PAGE_ADD = "assets/page_add.png";
    public readonly PAGE_REMOVE = "assets/page_remove.png";
    public readonly PAGE_REMOVE_DISABLE = "assets/page_remove_disable.png";
    public readonly PAGE_NEW = "assets/page_new.png";
    public readonly PAGE_NEW_DISABLE = "assets/page_new_disable.png";
    public readonly X_XSRF_TOKEN_COOKIE_NAME: string = "XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_HEADER: string = "X-XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_SESSION_KEY: string = "X-XSRF-SESSION-TOKEN";
    public readonly X_XSRF_TOKEN_PARAM_KEY: string = "xsrfToken";
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

    public readonly DEFAULT_TOOLBAR_SETTINGS:string = "bold italic underline | left center right |  format font size |" +
        " color | ul ol | outdent indent";
    public readonly ICON_TOPIC_OWNER:string = "assets/topic_tag_owner.png";
    public readonly ICON_TOPIC_MEMBER:string = "assets/topic_tag_members.png";
    public readonly ICON_TOPIC_PUBLIC:string = "assets/topic_tag_public.png";
    public readonly GLOBE_LINK:string ="assets/globe_link.png";
    public readonly EMAIL_GO_LINK:string="assets/email_go.png";



}
