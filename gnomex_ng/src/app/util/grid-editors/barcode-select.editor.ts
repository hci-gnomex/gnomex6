import {Component} from "@angular/core";
import {SelectEditor} from "./select.editor";
import {DictionaryService} from "../../services/dictionary.service";

@Component({
    templateUrl: "./select.editor.html",
    styles: [`
        .full-width  { width:  100%; }
        .full-height { height: 100%; }

        .flex-column-container {
            display: flex;
            flex-direction: row;
        }
        .flex-row  {
            display: flex;
        }
        .flex-stretch {
            display:flex;
            flex: 1;
        }
    `]
}) export class BarcodeSelectEditor extends SelectEditor {
    get indexTagLetter(): string {
        return this._indexTagLetter;
    }

    set indexTagLetter(value: string) {
        this._indexTagLetter = value;
    }
    idSeqLibProtocol: string;
    private _indexTagLetter: string;

    constructor(public dictionaryService: DictionaryService) {
        super();
    }

    agInit(params: any): void {
        super.agInit(params);
        this.indexTagLetter = params.column.colDef.indexTagLetter;
        this.idSeqLibProtocol = params.node.data.idSeqLibProtocol;
        let barcodes: any[] = [];
        let sortedBarcodes: any[] = [];
        let schemes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcodeScheme");
        let allowedSchemes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcodeSchemeAllowed");
        for (let scheme of schemes) {
            let keepScheme: boolean = false;
            for (let allowed of allowedSchemes) {
                if (scheme.idOligoBarcodeScheme === allowed.idOligoBarcodeScheme) {
                    if (((this.indexTagLetter === 'A' && allowed.isIndexGroupB ==='N') || (this.indexTagLetter === 'B' && allowed.isIndexGroupB === 'Y')) &&
                        (this.idSeqLibProtocol === '' || allowed.idSeqLibProtocol === this.idSeqLibProtocol)) {
                        keepScheme = true;
                        break;
                    }

                }
            }
            if (!keepScheme) {
                continue;
            }
            let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode").filter(c =>
                        c.isActive === 'Y' && c.idOligoBarcodeScheme === scheme.value)
            barcodes = barcodes.concat(codes);

        }
        sortedBarcodes = barcodes.sort((obj1, obj2) => {
            if (obj1 == null && obj2 == null) {
                return 0;
            } else if (obj1 == null) {
                return 1;
            } else if (obj2 == null) {
                return -1;
            } else {
                var order1: number = Number(obj1.sortOrder);
                var order2: number = Number(obj2.sortOrder);

                if (obj1.value == '') {
                    return -1;
                } else if (obj2.value == '') {
                    return 1;
                } else {
                    if (order1 < order2) {
                        return -1;
                    } else if (order1 > order2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }

        });
        this.options = sortedBarcodes;
    }

}
