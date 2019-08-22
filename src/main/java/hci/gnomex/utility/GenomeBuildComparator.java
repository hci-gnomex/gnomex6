package hci.gnomex.utility;

import hci.gnomex.model.GenomeBuild;

import java.io.Serializable;
import java.util.Comparator;

public class GenomeBuildComparator implements Comparator<GenomeBuild>, Serializable {

    public int compare(GenomeBuild v1, GenomeBuild v2) {
		if (v1.getBuildDate() != null && v2.getBuildDate() != null) {
			int dateComparison = v1.getBuildDate().compareTo(v2.getBuildDate());
			if (dateComparison != 0) {
				return dateComparison;
			}
		} else if (v1.getBuildDate() != null) {
			return 1;
		} else if (v2.getBuildDate() != null) {
			return -1;
		}

		return v1.getGenomeBuildName().compareTo(v2.getGenomeBuildName());
    }

}
