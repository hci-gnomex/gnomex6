USE GNomEx
GO

BEGIN TRANSACTION

DECLARE @commit INT = 1;

CREATE TABLE ColumnProperties
           ( idColumnProperties INT IDENTITY(1,1) NOT NULL
           , codeRequestCategory VARCHAR(10) 
           , gridType VARCHAR(50)
           , columnType VARCHAR(50)
           , header VARCHAR(50)
           , field VARCHAR(50)
           , nameField VARCHAR(50)
           , valueField VARCHAR(50)
           , nameFrontEndDictionaryToUse VARCHAR(50)
           , fullDictionaryModelPathToLoad VARCHAR(100)
           , editableEditMode VARCHAR(1)
           , editableNewMode VARCHAR(1)
           , showFillButton VARCHAR(1)
           , fillGroupAttribute VARCHAR(50)
           , sortOrder INT
           , showInEditMode VARCHAR(1)
           , showInNewMode VARCHAR(1)
           , showInNewSummaryMode VARCHAR(1)
           , showInViewMode VARCHAR(1)
           , showForExternal VARCHAR(1)
           , requiredInEditMode VARCHAR(1)
           , requiredInNewMode VARCHAR(1)
           , patternToMatch VARCHAR(100)
           , patternToMatchErrorMessage VARCHAR(100)
           , width NUMERIC(7,4)
           , minWidth NUMERIC(7,4)
           , maxWidth NUMERIC(7,4)
           , PRIMARY KEY(idColumnProperties)
           )
         
ALTER TABLE [dbo].ColumnProperties  WITH CHECK ADD  CONSTRAINT [FK_ColumnProperties_RequestCategory] FOREIGN KEY(codeRequestCategory)
REFERENCES [dbo].RequestCategory (codeRequestCategory)

SELECT *
  FROM GNomEx.dbo.ColumnProperties;


IF (@commit <> 0)
BEGIN
  PRINT('Committing changes');
  COMMIT;
END
ELSE
BEGIN
  PRINT('Rollback');
  ROLLBACK;
END