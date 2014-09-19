use gnomex;

--Hide/Show property for funding agency combo box on new billing account window
insert into PropertyDictionary (propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
	VALUES('show_funding_agency', 'N', 'Show the funding agency field for billing accounts', 'N', null, null);
	

--Add billing account to ProductOrder	
alter table ProductOrder add idBillingAccount int null;


--Property to specify where purchase order forms are stored.
insert into PropertyDictionary (propertyName, propertyValue, propertyDescription, forServerOnly, idCoreFacility, codeRequestCategory)
	VALUES('product_order_directory', '/home/gnomex/PurchseOrder_HSCGenomics', 'Directory to store purchase order forms', 'Y', null, null);
