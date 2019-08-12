use gnomex;

ENGINE = INNODB;

INSERT INTO Step(codeStep, step, isActive, sortOrder)
VALUES ('ILLSEQQC', 'Illumina Seq Quality Control', 'Y', NULL),
('ILLSEQPREP', 'Illumina Seq Library Prep', 'Y', NULL),
('ILLSEQPREPQC', 'Illumina Seq Library Prep QC', 'Y', NULL),
('ILLSEQASSEM', 'Illumina Seq Flow Cell Assembly', 'Y', NULL),
('ILLSEQFINFC', 'Illumina Seq Finalize FlowCell', 'Y', NULL),
('ILLSEQRUN', 'Illumina Seq Sequencing Run', 'Y', NULL),
('ILLSEQPIPE', 'Illumina Seq Data Pipeline', 'Y', NULL);

