package hci.gnomex.utility;

import hci.framework.model.DetailObject;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.json.JsonArray;
import javax.json.JsonObject;

public class FileDescriptorParser extends DetailObject implements Serializable {

    private JsonArray array;
    private Map<String, List<FileDescriptor>> fileDescriptorMap = new HashMap<>();

    public FileDescriptorParser(JsonArray array) {
        this.array = array;
    }

    public void parse() throws Exception {
        for (int i = 0; i < this.array.size(); i++) {
            JsonObject node = this.array.getJsonObject(i);
            String requestNumber = node.getString("number");
            FileDescriptor fd = this.initializeFileDescriptor(node);

            List<FileDescriptor> fileDescriptors = this.fileDescriptorMap.get(requestNumber);
            if (fileDescriptors == null) {
                fileDescriptors = new ArrayList<>();
                fileDescriptorMap.put(requestNumber, fileDescriptors);
            }
            fileDescriptors.add(fd);
        }
    }

    private FileDescriptor initializeFileDescriptor(JsonObject n) {
        FileDescriptor fd = new FileDescriptor();
        fd.setFileName(n.getString("fileName"));
        fd.setZipEntryName(n.getString("zipEntryName"));
        fd.setType(n.getString("type"));
        if (n.getString("fileSize").length() > 0) {
            long fileSize = Long.parseLong(n.getString("fileSize"));
            fd.setFileSize(fileSize);
        }
        return fd;
    }

    public Set<String> getRequestNumbers() {
        return fileDescriptorMap.keySet();
    }

    public List<FileDescriptor> getFileDescriptors(String requestNumber) {
        return fileDescriptorMap.get(requestNumber);
    }

}
