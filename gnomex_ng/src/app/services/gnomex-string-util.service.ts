import {Injectable} from "@angular/core";

@Injectable()
export class GnomexStringUtilService {

    constructor() {
    }
    public static stripHTMLText(htmlText:string):string {
        var pattern:RegExp = /<P.*?>/g;
        var str:string = htmlText.replace(pattern, "");
        pattern = /<\/P.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<B.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/B.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<U.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/U.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<LI.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/LI.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<I.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/I.*?>/g;
        str = str.replace(pattern, "");

        //pattern = /<U.*?>/g;
        //str = str.replace(pattern, "");
        //pattern = /<\/U.*?>/g;
        //str = str.replace(pattern, "");
        return GnomexStringUtilService.cleanRichTextHTML(str);
    }

    public static cleanRichTextHTML(htmlText:string):string {
        let pattern:RegExp = /<TEXTFORMAT.*?>/g;
        let str:string = htmlText.replace(pattern, "");
        pattern = /<FONT.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/FONT.*?>/g;
        str = str.replace(pattern, "");
        pattern = /<\/TEXTFORMAT.*?>/g;
        str = str.replace(pattern, "");

        return str;
    }

}
