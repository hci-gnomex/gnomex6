-- Add "menu_Workflow..." property with hide attribute to PropertyDictionary for Bioinformatics core facility
use gnomex;

DECLARE @idCoreFacility INT = -1;

DECLARE @propertyName        VARCHAR(200)  = 'menu_Workflow...';
DECLARE @propertyValue       VARCHAR(2000) = 'hide';

SELECT TOP(1) @idCoreFacility = cf.idCoreFacility
  FROM GNomEx.dbo.CoreFacility cf
 WHERE cf.facilityName = 'Bioinformatics';

IF @idCoreFacility <> -1
BEGIN
    DECLARE @temp INT;

    SELECT @temp = COUNT(*)
      FROM GNomEx.dbo.PropertyDictionary pd
     WHERE pd.propertyName = @propertyName
       AND pd.idCoreFacility = @idCoreFacility;

    IF @temp = 0
    BEGIN

      INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
      VALUES (@propertyName, @propertyValue, NULL, 'N', @idCoreFacility, NULL);

    END
    ELSE
    BEGIN

      UPDATE GNomEx.dbo.PropertyDictionary
         SET propertyValue = @propertyValue
       WHERE propertyName = @propertyName
         AND idCoreFacility = @idCoreFacility
         AND forServerOnly = 'N';

    END
END
