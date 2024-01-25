package hci.gnomex.model;

import hci.dictionary.model.DictionaryEntry;

import java.io.Serializable;
//import hci.gnomex.security.SecurityAdvisor;


public class ColumnProperties extends DictionaryEntry implements Serializable {

	private Integer idColumnProperties;
	private String codeRequestCategory;
	private String gridType;
	private String columnType;
	private String header;
	private String field;
	private String nameField;
	private String valueField;
	private String nameFrontEndDictionaryToUse;
	private String fullDictionaryModelPathToLoad;
	private String editableEditMode;
	private String editableNewMode;
	private String showFillButton;
	private String fillGroupAttribute;
	private Integer sortOrder;
	private String showInNewMode;
	private String showInNewSummaryMode;
	private String showInViewMode;
	private String showInEditMode;
	private String showForExternal;
	private String requiredInNewMode;
	private String requiredInEditMode;
	private String patternToMatch;
	private String patternToMatchErrorMessage;

	private String width;
	private String minWidth;
	private String maxWidth;


	public ColumnProperties() { }


	@Override
	public String getDisplay() {
		return this.nameField;
	}

	@Override
	public String getValue() {
		return this.idColumnProperties != null ? "" + this.idColumnProperties : "";
	}


	public Integer getIdColumnProperties() {
		return this.idColumnProperties;
	}
	public void setIdColumnProperties(Integer idColumnProperties) {
		this.idColumnProperties = idColumnProperties;
	}

	public String getCodeRequestCategory() {
		return this.codeRequestCategory;
	}
	public void setCodeRequestCategory(String codeRequestCategory) {
		this.codeRequestCategory = codeRequestCategory;
	}

	public String getGridType() {
		return this.gridType;
	}
	public void setGridType(String gridType) {
		this.gridType = gridType;
	}

	public String getColumnType() {
		return this.columnType;
	}
	public void setColumnType(String columnType) {
		this.columnType = columnType;
	}

	public String getHeader() {
		return this.header;
	}
	public void setHeader(String header) {
		this.header = header;
	}

	public String getField() {
		return this.field;
	}
	public void setField(String field) {
		this.field = field;
	}

	public String getNameField() {
		return this.nameField;
	}
	public void setNameField(String nameField) {
		this.nameField = nameField;
	}

	public String getValueField() {
		return this.valueField;
	}
	public void setValueField(String valueField) {
		this.valueField = valueField;
	}

	public String getNameFrontEndDictionaryToUse() {
		return this.nameFrontEndDictionaryToUse;
	}
	public void setNameFrontEndDictionaryToUse(String nameFrontEndDictionaryToUse) {
		this.nameFrontEndDictionaryToUse = nameFrontEndDictionaryToUse;
	}

	public String getFullDictionaryModelPathToLoad() {
		return this.fullDictionaryModelPathToLoad;
	}
	public void setFullDictionaryModelPathToLoad(String fullDictionaryModelPathToLoad) {
		this.fullDictionaryModelPathToLoad = fullDictionaryModelPathToLoad;
	}

	public String getEditableEditMode() {
		return this.editableEditMode;
	}
	public void setEditableEditMode(String editableEditMode) {
		this.editableEditMode = editableEditMode;
	}

	public String getEditableNewMode() {
		return this.editableNewMode;
	}
	public void setEditableNewMode(String editableNewMode) {
		this.editableNewMode = editableNewMode;
	}

	public String getShowFillButton() {
		return this.showFillButton;
	}
	public void setShowFillButton(String showFillButton) {
		this.showFillButton = showFillButton;
	}

	public String getFillGroupAttribute() {
		return this.fillGroupAttribute;
	}
	public void setFillGroupAttribute(String fillGroupAttribute) {
		this.fillGroupAttribute = fillGroupAttribute;
	}

	public Integer getSortOrder() {
		return this.sortOrder;
	}
	public void setSortOrder(Integer sortOrder) {
		this.sortOrder = sortOrder;
	}

	public String getShowInNewMode() {
		return this.showInNewMode;
	}
	public void setShowInNewMode(String showInNewMode) {
		this.showInNewMode = showInNewMode;
	}

	public String getShowInNewSummaryMode() {
		return this.showInNewSummaryMode;
	}
	public void setShowInNewSummaryMode(String showInNewSummaryMode) {
		this.showInNewSummaryMode = showInNewSummaryMode;
	}

	public String getShowInEditMode() {
		return this.showInEditMode;
	}
	public void setShowInEditMode(String showInEditMode) {
		this.showInEditMode = showInEditMode;
	}

	public String getShowForExternal() {
		return this.showForExternal;
	}
	public void setShowForExternal(String showForExternal) {
		this.showForExternal = showForExternal;
	}

	public String getShowInViewMode() {
		return this.showInViewMode;
	}
	public void setShowInViewMode(String showInViewMode) {
		this.showInViewMode = showInViewMode;
	}

	public String getRequiredInNewMode() {
		return this.requiredInNewMode;
	}
	public void setRequiredInNewMode(String requiredInNewMode) {
		this.requiredInNewMode = requiredInNewMode;
	}

	public String getRequiredInEditMode() {
		return this.requiredInEditMode;
	}
	public void setRequiredInEditMode(String requiredInEditMode) {
		this.requiredInEditMode = requiredInEditMode;
	}

	public String getPatternToMatch() {
		return this.patternToMatch;
	}
	public void setPatternToMatch(String patternToMatch) {
		this.patternToMatch = patternToMatch;
	}

	public String getPatternToMatchErrorMessage() {
		return this.patternToMatchErrorMessage;
	}
	public void setPatternToMatchErrorMessage(String patternToMatchErrorMessage) {
		this.patternToMatchErrorMessage = patternToMatchErrorMessage;
	}

	public String getWidth() {
		return this.width;
	}
	public void setWidth(String width) {
		this.width = width;
	}

	public String getMinWidth() {
		return this.minWidth;
	}
	public void setMinWidth(String minWidth) {
		this.minWidth = minWidth;
	}

	public String getMaxWidth() {
		return this.maxWidth;
	}
	public void setMaxWidth(String maxWidth) {
		this.maxWidth = maxWidth;
	}
}
