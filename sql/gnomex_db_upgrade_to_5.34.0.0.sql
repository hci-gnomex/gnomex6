use gnomex;

alter table Request add column archived char(1) NULL;

CALL ExecuteIfTableExists('gnomex','Request_Audit','ALTER TABLE Request_Audit ADD COLUMN archived CHAR(1) NULL');

--  Add properties for site title
INSERT INTO PropertyDictionary (propertyName, propertyValue, propertyDescription, forServerOnly )
VALUES ('show_title_box', 'N', 'Show site title and welcome message on home page', 'N' );

INSERT INTO PropertyDictionary (propertyName, propertyValue, propertyDescription, forServerOnly )
VALUES ('directory_bioinformatics_scratch','/bioScratch','Where experiment soft links are created','N');


DROP TABLE IF EXISTS gnomex.DNAPrepType;
DROP TABLE IF EXISTS gnomex.DNAPrepType_Audit;
DROP TABLE IF EXISTS gnomex.RNAPrepType;
DROP TABLE IF EXISTS gnomex.RNAPrepType_Audit;
