-- Update patternToMatch and patternToMatchErrorMessage in ColumnProperties table regarding the column size and data type in Sample table.
use gnomex;

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^\d{0,1}(\.\d{1,2})?$', patternToMatchErrorMessage = 'Expects a decimal number (3,2)'
WHERE field IN (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field IN ('qual260nmTo230nmRatio', 'qual260nmTo280nmRatio')
);

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^\d{0,7}(\.\d{1,1})?$', patternToMatchErrorMessage = 'Expects a decimal number (8,1)'
WHERE field = (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field = 'sampleVolume'
);

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^(-)?\d{0,6}(\.\d{1,2})?$', patternToMatchErrorMessage = 'Expects a decimal number (8,2)'
WHERE field = (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field = 'qualCalcConcentration'
);

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^(-)?\d{0,5}(\.\d{1,3})?$', patternToMatchErrorMessage = 'Expects a decimal number (8,3)'
WHERE field = (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field = 'concentration'
);

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^\d{0,10}$', patternToMatchErrorMessage = 'Expects an integer number'
WHERE field IN (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field IN ('meanLibSizeActual', 'qualFragmentSizeFrom', 'qualFragmentSizeTo')
);

UPDATE GNomEx.dbo.ColumnProperties
SET patternToMatch = '^((\d*(\.\d+)?)|([Nn]\/?[Aa])|(-))$', patternToMatchErrorMessage = 'Expects a decimal number or N/A or -'
WHERE field = (
SELECT DISTINCT cp.field FROM GNomEx.dbo.ColumnProperties cp WHERE cp.field = 'qualRINNumber'
);

