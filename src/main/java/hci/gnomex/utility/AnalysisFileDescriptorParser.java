package hci.gnomex.utility;

import hci.framework.model.DetailObject;

import javax.json.JsonArray;
import javax.json.JsonObject;
import java.io.Serializable;
import java.util.*;

public class AnalysisFileDescriptorParser extends DetailObject implements Serializable {

    private JsonArray array;
    private Map<String, List<FileDescriptor>> fileDescriptorMap = new HashMap<>();

    public AnalysisFileDescriptorParser(JsonArray array) {
        this.array = array;
    }

    public void parse() throws Exception {
        for (int i = 0; i < this.array.size(); i++) {
            JsonObject node = this.array.getJsonObject(i);
            String analysisNumber = node.getString("number");

            FileDescriptor fd = this.initializeFileDescriptor(node);

            List<FileDescriptor> fileDescriptors = this.fileDescriptorMap.get(analysisNumber);
            if (fileDescriptors == null) {
                fileDescriptors = new ArrayList<>();
                fileDescriptorMap.put(analysisNumber, fileDescriptors);
            }
            fileDescriptors.add(fd);
        }
    }

    private FileDescriptor initializeFileDescriptor(JsonObject n) {
        FileDescriptor fd = new FileDescriptor();

        String idAnalysis = Util.getJsonStringSafe(n, "idAnalysis");
        fd.setId(idAnalysis != null && !idAnalysis.isEmpty() ? Integer.valueOf(idAnalysis) : null);
        fd.setFileName(n.getString("fileName"));
        fd.setQualifiedFilePath(n.getString("qualifiedFilePath"));
        fd.setBaseFilePath(n.getString("baseFilePath"));
        fd.setZipEntryName(n.getString("zipEntryName"));
        fd.setType(n.getString("type"));
        if (n.getString("fileSize").length() > 0) {
            long fileSize = Long.parseLong(n.getString("fileSize"));
            fd.setFileSize(fileSize);
        }
        fd.setNumber(n.getString("number"));

        return fd;
    }

    public Set<String> getAnalysisNumbers() {
        return fileDescriptorMap.keySet();
    }

    public List<FileDescriptor> getFileDescriptors(String analysisNumber) {
        return fileDescriptorMap.get(analysisNumber);
    }

}
