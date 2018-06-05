import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button {{classes}}"><img *ngIf="showIcon" src="{{icon}}" alt=""/><div class="name inline-block">{{value}}</div></button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
					border: none;
					padding: 0;
					text-decoration: underline;
					cursor: pointer;
			}
      
			button.link-button:focus {
					outline: none;
      }
			
      .button-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.inline-block { display: inline-block; }
			
			.vertical-center { vertical-align: middle; }
			
			.name {
					padding-left: 0.5rem;
          text-decoration: underline;
			}
			.is-active {
					color: #0000FF;
					font-weight: bold;
					font-style: normal;
			}
      .is-not-active {
          color: #6a6b6e;
          font-weight: normal;
          font-style: italic;
      }
	`]
})
export class IconLinkButtonRenderer implements ICellRendererAngularComp {
	public params: any;
	public static readonly ACTIVE: string = "is-active";
	public static readonly INACTIVE: string = "is-not-active";
	public classes: string;
	public icon: string;
	public showIcon: boolean;
	public value: string;
	private onClick;

	agInit(params: any): void {
		this.params = params;
		this.value = "";
		this.icon = "";
		this.showIcon = false;

		this.classes = "";
		this.checkIfActive();

		if (this.params) {
			this.value = "" + this.params.value;
		}

		if (this.params && this.params.colDef) {
			this.onClick = this.params.colDef.onClick;
			this.icon = this.params.colDef.icon;
			if (this.icon) {
				this.showIcon = true;
			}
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfActive(): void {
		if (this.params && this.params.data && this.params.data.isActive && this.params.data.isActive.toLowerCase() == 'y') {
			this.classes = this.classes + " " + IconLinkButtonRenderer.ACTIVE;
		} else {
			this.classes = this.classes + " " + IconLinkButtonRenderer.INACTIVE;
		}
	}

	invokeParentMethod(): void {
		if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent[this.onClick](this.params.node);
			// this.onClick(this.params.node.rowIndex);
		}
	}
}
