
DECLARE @idCoreFacility INT = -1;

DECLARE @codeRequestCategory_IlluminaMiSeqSequencing   VARCHAR(10) = -1;
DECLARE @codeRequestCategory_IlluminaHiSeqSequencing   VARCHAR(10) = -1;
DECLARE @codeRequestCategory_IlluminaNovaSeqSequencing VARCHAR(10) = -1;
DECLARE @codeRequestCategory_IlluminaSequencing        VARCHAR(10) = -1;
DECLARE @codeRequestCategory_MDMiSeq                   VARCHAR(10) = -1;

DECLARE @propertyName        VARCHAR(200)  = 'allow_price_quote';
DECLARE @propertyValue       VARCHAR(2000);
DECLARE @propertyDescription VARCHAR(2000) = 'This flag permits the "Generate Price Quote" button to appear in the New Experiment feature.';

SELECT TOP(1) @idCoreFacility = cf.idCoreFacility
  FROM GNomEx.dbo.CoreFacility cf
 WHERE cf.facilityName = 'High Throughput Genomics';

-- PRINT (@idCoreFacility)

SELECT TOP(1) @codeRequestCategory_IlluminaMiSeqSequencing = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'Illumina MiSeq Sequencing';

-- PRINT (@codeRequestCategory_IlluminaMiSeqSequencing)

SELECT TOP(1) @codeRequestCategory_IlluminaHiSeqSequencing = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'Illumina HiSeq Sequencing';

-- PRINT (@codeRequestCategory_IlluminaHiSeqSequencing)

SELECT TOP(1) @codeRequestCategory_IlluminaNovaSeqSequencing = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'Illumina NovaSeq Sequencing';

-- PRINT (@codeRequestCategory_IlluminaNovaSeqSequencing)

SELECT TOP(1) @codeRequestCategory_IlluminaSequencing = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'Illumina Sequencing';

-- PRINT (@codeRequestCategory_IlluminaSequencing)

DECLARE @temp INT;

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility IS NULL
   AND pd.codeRequestCategory IS NULL;

IF @temp = 0
BEGIN

  SET @propertyValue = 'N';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', NULL, NULL);

END
ELSE
BEGIN
  
  SET @propertyValue = 'N';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility IS NULL
     AND codeRequestCategory IS NULL;

END

-------------------------------------------------------------------------------------------

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory IS NULL;

IF @temp = 0
BEGIN

  SET @propertyValue = 'N';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, NULL);

END
ELSE
BEGIN
  
  SET @propertyValue = 'N';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory IS NULL;

END

-------------------------------------------------------------------------------------------

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_IlluminaHiSeqSequencing;

IF @temp = 0
BEGIN

  SET @propertyValue = 'Y';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_IlluminaHiSeqSequencing);

END
ELSE
BEGIN
  
  SET @propertyValue = 'Y';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_IlluminaHiSeqSequencing;

END

-------------------------------------------------------------------------------------------

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_IlluminaMiSeqSequencing;

IF @temp = 0
BEGIN

  SET @propertyValue = 'Y';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_IlluminaMiSeqSequencing);

END
ELSE
BEGIN
  
  SET @propertyValue = 'Y';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_IlluminaMiSeqSequencing;

END

-------------------------------------------------------------------------------------------

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_IlluminaNovaSeqSequencing;

IF @temp = 0
BEGIN

  SET @propertyValue = 'Y';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_IlluminaNovaSeqSequencing);

END
ELSE
BEGIN
  
  SET @propertyValue = 'Y';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_IlluminaNovaSeqSequencing;

END

-------------------------------------------------------------------------------------------

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_IlluminaSequencing;

IF @temp = 0
BEGIN

  SET @propertyValue = 'Y';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_IlluminaSequencing);

END
ELSE
BEGIN
  
  SET @propertyValue = 'Y';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_IlluminaSequencing;

END
       
-------------------------------------------------------------------------------------------

SELECT TOP(1) @idCoreFacility = cf.idCoreFacility
  FROM GNomEx.dbo.CoreFacility cf
 WHERE cf.facilityName = 'Molecular Diagnostics';

-- PRINT (@idCoreFacility)

SET @propertyName        = 'hide_multiplex_lane_column';
SET @propertyDescription = 'This property determines whether to include the "Multiplex Group #" column in the samples grid. (the view samples grid always includes this field for illumina sample types';


SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility IS NULL
   AND pd.codeRequestCategory IS NULL;

IF @temp = 0
BEGIN

  SET @propertyValue = 'N';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', NULL, NULL);

END
ELSE
BEGIN
  
  SET @propertyValue = 'N';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = NULL
     AND codeRequestCategory = NULL;

END
       
-------------------------------------------------------------------------------------------

SELECT TOP(1) @idCoreFacility = cf.idCoreFacility
  FROM GNomEx.dbo.CoreFacility cf
 WHERE cf.facilityName = 'Molecular Diagnostics';

-- PRINT (@idCoreFacility)

SELECT TOP(1) @codeRequestCategory_MDMiSeq = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'MD MiSeq';

-- PRINT (@codeRequestCategory_IlluminaMiSeqSequencing)

SET @propertyName        = 'hide_multiplex_lane_column';
SET @propertyDescription = 'This property determines whether to include the "Multiplex Group #" column in the samples grid. (the view samples grid always includes this field for illumina sample types';

SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_MDMiSeq;

IF @temp = 0
BEGIN

  SET @propertyValue = 'Y';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_MDMiSeq);

END
ELSE
BEGIN
  
  SET @propertyValue = 'Y';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_MDMiSeq;

END
       
-------------------------------------------------------------------------------------------

SELECT TOP(1) @idCoreFacility = cf.idCoreFacility
  FROM GNomEx.dbo.CoreFacility cf
 WHERE cf.facilityName = 'Molecular Diagnostics';

-- PRINT (@idCoreFacility)

SELECT TOP(1) @codeRequestCategory_MDMiSeq = rc.codeRequestCategory
  FROM GNomEx.dbo.RequestCategory rc
 WHERE rc.idCoreFacility = @idCoreFacility
   AND rc.requestCategory = 'MD MiSeq';

-- PRINT (@codeRequestCategory_IlluminaMiSeqSequencing)

SET @propertyName        = 'default_value_multiplex_lane_column';
SET @propertyDescription = 'This property determines the default value of the "Multiplex Group #" column in the samples grid, whether it is hidden or no.';


SELECT @temp = COUNT(*)
  FROM GNomEx.dbo.PropertyDictionary pd
 WHERE pd.propertyName = @propertyName
   AND pd.idCoreFacility = @idCoreFacility
   AND pd.codeRequestCategory = @codeRequestCategory_MDMiSeq;

IF @temp = 0
BEGIN

  SET @propertyValue = '1';

  INSERT INTO GNomEx.dbo.PropertyDictionary(propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
  VALUES (@propertyName, @propertyValue, @propertyDescription, 'N', @idCoreFacility, @codeRequestCategory_MDMiSeq);

END
ELSE
BEGIN
  
  SET @propertyValue = '1';

  UPDATE GNomEx.dbo.PropertyDictionary
     SET propertyValue = @propertyValue
       , propertyDescription = @propertyDescription
   WHERE propertyName = @propertyName
     AND idCoreFacility = @idCoreFacility
     AND codeRequestCategory = @codeRequestCategory_MDMiSeq;

END
       