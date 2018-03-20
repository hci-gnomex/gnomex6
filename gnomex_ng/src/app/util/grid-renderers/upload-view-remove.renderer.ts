import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button" (click)="invokeParentOnClickUpload()">
							<img src="../../../assets/upload.png" alt=""/>
							<div class="name inline-block">
								Upload
							</div>
						</button>
						<button *ngIf="hasPoForm" class="link-button" (click)="invokeParentOnClickView()">
							<img src="../../../assets/page_find.gif" alt=""/>
							<div class="name inline-block">
								View
							</div>
						</button>
						<button *ngIf="hasPoForm" class="link-button" (click)="invokeParentOnClickRemove()">
							<img src="../../../assets/page_cross.gif" alt=""/>
							<div class="name inline-block">
								Remove
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
          color: #0000FF;
					border: none;
					padding: 0;
					cursor: pointer;
					margin-right: 0.6rem;
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
					padding-left: 0.2rem;
          text-decoration: underline;
			}
	`]
})
export class UploadViewRemoveRenderer implements ICellRendererAngularComp {
	public params: any;
	public hasPoForm: boolean;
	private onClickUpload;
	private onClickView;
	private onClickRemove;

	agInit(params: any): void {
		this.params = params;
		this.hasPoForm = false;

		this.checkIfHasPoForm();

		if (this.params && this.params.colDef) {
			this.onClickUpload = this.params.colDef.onClickUpload;
			this.onClickView   = this.params.colDef.onClickView;
			this.onClickRemove = this.params.colDef.onClickRemove;
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfHasPoForm(): void {
		if (this.params && this.params.data && this.params.data.isActive && this.params.data.isActive.toLowerCase() == 'y') {
			this.hasPoForm = true;
		} else {
			this.hasPoForm = false;
		}
	}

	invokeParentOnClickUpload(): void {
		if (this.onClickUpload && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickUpload(this.params.node.rowIndex);
		}
	}

	invokeParentOnClickView(): void {
		if (this.onClickView && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickView(this.params.node.rowIndex);
		}
	}

	invokeParentOnClickRemove(): void {
		if (this.onClickRemove && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickRemove(this.params.node.rowIndex);
		}
	}
}