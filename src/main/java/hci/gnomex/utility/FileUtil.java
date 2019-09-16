package hci.gnomex.utility;

import hci.gnomex.constants.Constants;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileUtil {

	/*
	 * Indicates if file is a link file on unix.
	 */
	public static boolean isSymlink(File file) {
		try {
			if (file == null) {
				return false;
			}
			File canon;

			if (file.getParent() == null) {
				canon = file;
			} else {
				File canonDir = file.getParentFile().getCanonicalFile();
				canon = new File(canonDir, file.getName());
			}

			return !canon.getCanonicalFile().equals(canon.getAbsoluteFile());
		} catch (IOException ex) {
			return false;
		}
	}

	public static boolean renameTo (File sourceFile, File destFile) {
		boolean success = false;
		try {
			Path sourcePath = sourceFile.toPath();
			Path targetPath = destFile.toPath();
			Files.move(sourcePath,targetPath);
			success = true;
		}
		catch (Exception rex) {
			System.out.println ("[FileUtil.renameTo] move error: " + rex.toString());
			success = false;
		}

		return success;
	}

	/**
	 * Recursively finds and removes any empty subdirectories in the provided directory.
	 * Removes the provided directory if it is (or becomes) empty.
	 * @param directoryName The path of the directory to be pruned
	 */
	public static void pruneEmptyDirectories(String directoryName) {
		File directory = new File(directoryName);
		String directoryPath = directory.getAbsolutePath().replace("\\", Constants.FILE_SEPARATOR);
		if (directory.exists()) {
			for (String fileName : directory.list()) {
				File file = new File(directoryPath + Constants.FILE_SEPARATOR + fileName);
				if (file.isDirectory()) {
					pruneEmptyDirectories(file.getAbsolutePath());
				}
			}
			if (directory.list().length == 0) {
				directory.delete();
			}

		}

	}

	public static boolean symlinkLoop(String filename) {
		File file = new File(filename);
		if (!file.exists() || !file.isDirectory()) {
			return false;
		}
		return symlinkLoop(file);
	}

	public static boolean symlinkLoop(File file) {

		if (file != null && file.exists() && file.isDirectory()) {
			try {
				Path p = Paths.get(file.getAbsolutePath());
				if (!Files.isSymbolicLink(p)) {
					return false;
				}

				Path rp = p.toRealPath();

				Path sl = Files.readSymbolicLink(p);
				Path slrp = sl.toRealPath();
				Path cd = Paths.get(".");
				Path cdrp = cd.toRealPath();

				if (Files.isSymbolicLink(p) && Files.isSymbolicLink(rp)) {
//          System.out.println("Found a loop");
					return true;
				}

				if (slrp.toString().equals(cdrp.toString())) {
//          System.out.println("Found a loop!");
					return true;
				}

				return false;
			} catch (IOException e) {
				return false;
			}
		}

		return false;
	}

}
