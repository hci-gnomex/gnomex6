import{Component} from '@angular/core';

@Component({
    selector: 'sample-sheet-column-formats',
    templateUrl: 'sample-sheet-column-formats.component.html',
    styles: [`
        
        pre { margin-bottom: 0; }
        
        
        .no-margin { margin: 0; }

        .no-max-height { max-height: none; }
        
        .title {
            background-color: #84b278;
            color: white;
            font-size: larger;
        } 

        .foreground { background-color: white;   }
        .background { background-color: #eeeeee; }

        .bordered { border: solid silver 1px; }
        
        
        .padded { padding: 0.3rem; }

        .padded-left-right-bottom {
            padding: 0;

            padding-left:   0.3rem;
            padding-right:  0.3rem;
            padding-bottom: 0.3rem;
        }
        
    `]
})
export class SampleSheetColumnFormatsComponent {
    constructor() { }
}