import {Injectable} from "@angular/core";

@Injectable()
export class ConstantsService {

    public static readonly FILE_EXTENSIONS_FOR_VIEW: string[] = [
        ".pdf", ".jpg", ".png", ".gif", ".rtf", ".txt", ".html", ".htm", ".csv", ".ppt", ".pptx",
        ".xls", ".xlsx", ".xml", ".ped", ".Rmd", ".md",
    ];

    public static readonly emailRegex: RegExp = /^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/;

    public static readonly CODE_PRODUCT_ORDER_STATUS_NEW: string = "NEW";


    public readonly PROPERTY_EXPERIMENT_PLATFORM_HIDE_NOTES: string = "experiment_platform_hide_notes";
    public readonly PROPERTY_EXPERIMENT_PLATFORM_HIDE_VENDOR: string = "experiment_platform_hide_vendor";
    public readonly PROPERTY_EXPERIMENT_PLATFORM_HIDE_ORGANISM: string = "experiment_platform_hide_organism";
    public readonly UPLOAD_FILE_FDT_INFO: string =
        "This method of uploading files uses a Fast Data Transfer (FDT) server. To upload files:<br><br>" +
        "     1. Select the \"Start\" button below.<br><br>" +
        "     2. This will download a special \"jnlp\" file that can be opened using Java Web Start (either directly or after first saving<br>         the file to your desktop).<br><br>" +
        "     3. Use the window launched by Java Web Start to select and upload the files to the server.<br><br> " +
        "     4. After all of the files have been uploaded (% Completed column indicates 100 for all files), click the<br>        \"Organize files\" link on Experiment Detail to move the uploaded files to the appropriate folders.<br>         button.";

    public readonly ICON_CHECKED = "assets/tick.png";
    public readonly SEGMENT_NEW = "assets/segment_new.png";
    public readonly SEGMENT_REMOVE = "assets/segment_remove.png";
    public readonly SEGMENT_NEW_DISABLE = "assets/segment_new_disable.png";
    public readonly SEGMENT_REMOVE_DISABLE = "assets/segment_remove_disable.png";
    public readonly SEGMENT_IMPORT = "assets/segment_import.png";
    public readonly SEGMENT_IMPORT_DISABLE = "assets/segment_remove_disable.png";
    public readonly PAGE = "assets/page.png";
    public readonly PAGE_ADD = "assets/page_add.png";
    public readonly PAGE_GO = "assets/page_go.png";
    public readonly PAGE_REMOVE = "assets/page_remove.png";
    public readonly PAGE_REMOVE_DISABLE = "assets/page_remove_disable.png";
    public readonly PAGE_NEW = "assets/page_new.png";
    public readonly PAGE_WHITE_ACROBAT = "assets/page_white_acrobat.png";
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



    public readonly DEFAULT_TOOLBAR_SETTINGS: string = "bold italic underline | left center right |  format font size |" +
        " color | ul ol | outdent indent";
    public readonly ICON_SAVE: string = "assets/save.png";
    public readonly GLOBE_LINK: string = "assets/globe_link.png";
    public readonly ICON_MAGNIFIER:string ="assets/magnifier.png";
    public readonly ICON_TABLE_LINK: string = "assets/table_link.png";
    public readonly EMAIL_GO_LINK: string = "assets/email_go.png";
    public readonly ICON_UCSC: string = "assets/ucscFavicon.png";
    public readonly ICON_IGV: string = "assets/igv.png";
    public readonly ICON_IOBIO: string = "assets/iobio.png";
    public readonly ICON_LINK: string = "assets/icon_link.gif";
    public readonly ICON_DELETE_LINK: string = "assets/link_delete.png";
    public readonly ICON_DOWNLOAD: string = "assets/download.png";
    public readonly ICON_DOWNLOAD_LARGE: string = "assets/download_large.png";

    public readonly ICON_ANALYSIS: string = "assets/map.png";
    public readonly ICON_ANALYSIS_ADD: string = "assets/map_add.png";
    public readonly ICON_TOPIC: string = "assets/topic_tag.png";
    public readonly ICON_TOPIC_PUBLIC: string = "assets/topic_tag_public.png";
    public readonly ICON_TOPIC_MEMBER: string = "assets/topic_tag_members.png";
    public readonly ICON_TOPIC_INSTITUTION: string = "assets/topic_tag_institution.png";
    public readonly ICON_TOPIC_OWNER: string = "assets/topic_tag_owner.png";

    public readonly ICON_DATATRACK: string = "assets/datatrack.png";
    public readonly ICON_DATATRACK_NEW: string = "assets/datatrack_new.png";
    public readonly ICON_DATATRACK_PUBLIC: string = "assets/datatrack_world.png";
    public readonly ICON_DATATRACK_MEMBER: string = "assets/datatrack_member.png";
    public readonly ICON_DATATRACK_MEMBERCOLLAB: string = "assets/datatrack_member.png";
    public readonly ICON_DATATRACK_INSTITUTION: string = "assets/datatrack_institution.png";
    public readonly ICON_DATATRACK_OWNER: string = "assets/datatrack_owner.png" ;

    public readonly ICON_CANCEL: string =  "assets/icon-cancel.png";
    public readonly ICON_CLOSE_BLACK: string = "assets/close_black.png";
    public readonly ICON_GREEN_BULLET: string = "assets/bullet_green.png";
    public readonly ICON_BLUE_FOLDER: string = "assets/blue_folder.png";
    public readonly ICON_FOLDER: string = "assets/folder.png";
    public readonly ICON_FOLDER_NEW: string = "assets/folder_new.png";
    public readonly ICON_FOLDER_GROUP: string = "assets/folder_group.png";
    public readonly ICON_FOLDER_ADD: string = "assets/folder_add.png";
    public readonly ICON_FLASK: string = "assets/flask.png";
    public readonly ICON_ORGANISM: string = "assets/organism.jpg";
    public readonly ICON_ORGANISM_NEW: string = "assets/organism_new.png";
    public readonly ICON_GENOME_BUILD_NEW: string = "assets/genome_build_new.png";
    public readonly ICON_ADD: string = "assets/add.png";
    public readonly ICON_DELETE: string = "assets/delete.png";
    public readonly ICON_CROSS: string = "assets/cross.png";
    public readonly ICON_CROSSOUT: string = "assets/crossout.png";
    public readonly ICON_DUPLICATE: string = "assets/duplicate.png";
    public readonly ICON_FOLDER_DELETE: string = "assets/folder_delete.png";
    public readonly ICON_FOLDER_DISABLE: string = "assets/folder_disable.png";
    public readonly ICON_BASKET: string = "assets/basket.png";
    public readonly ICON_REFRESH: string = "assets/refresh.png";
    public readonly EXP_ICON_LIST: string[] =
        [ "assets/noIcon.png", "assets/DNA_diag.png", "assets/DNA_diag_lightening.png", "assets/microarray_chip.png",
            "assets/microarray_small.png", "assets/microarray_small_single_color.png", "assets/chart_line.png",
            "assets/dna-helix-icon.png", "assets/cherrypick.png", "assets/fraganal.png", "assets/mitseq.png",
            "assets/DNA_diag_miseq.png", "assets/iscan.png", "assets/sequenom_clinical.png", "assets/sequenom_plate.png",
            "assets/DNA_test_tube.png", "assets/data-accept.png", "assets/nano.png", "assets/flask.png"];


    public readonly ICON_INFORMATION: string = "assets/information.png";
    public readonly ICON_UPLOAD: string = "assets/upload.png";
    public readonly ICON_UPLOAD_LARGE: string = "assets/upload_large.png";
    public readonly ICON_CHART_ORGANIZATION: string = "assets/chart_organisation.png";
    public readonly ICON_ARROW_LEFT: string = "assets/arrow_left.gif";
    public readonly ICON_ARROW_RIGHT: string = "assets/arrow_right.gif";
    public readonly ICON_DATABASE_LIGHTNING: string = "assets/database_lightning.png";
    public readonly ICON_TABLE_MULTIPLE: string = "assets/table_multiple.png";
    public readonly ICON_TAG_BLUE_EDIT: string = "assets/tag_blue_edit.png";

    public readonly STATUS_IN_PROGRESS: string = "In Progress";
    public readonly STATUS_COMPLETED: string = "Completed";
    public readonly STATUS_TERMINATED: string = "Terminated";
    public readonly STATUS_BYPASSED: string = "Bypassed";
    public readonly STATUS_ON_HOLD: string = "On Hold";

    public readonly MAX_LENGTH_5000: number = 5000;
    public readonly MAX_LENGTH_4000: number = 4000;
    public readonly MAX_LENGTH_500: number = 500;
    public readonly MAX_LENGTH_200: number = 200;



    public getTreeIcon(item: any, name: string) {
        if(item.icon) {
            return;
        }

        if (name === "DataTrack") {
            this.getDataTrackIcon(item, name);
        } else if (name === "Analysis") {
            item.icon = this.ICON_ANALYSIS;
        } else if (name === "RequestCategory") {
            item.icon = this.ICON_BASKET;
        } else if (name === "Topic") {
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
        } else if (name === "SequenceLane") {
            item.icon = this.ICON_GREEN_BULLET;
        } else if (name === "Request") {
            item.icon = this.ICON_FLASK;
        }

    }


    private getDataTrackIcon(item: any, name: string): void {

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
        } else {
            item.icon = this.ICON_DATATRACK;
        }

    }

}
