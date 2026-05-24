package com.bookingtoursonla.config;

import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.bookingtoursonla.BackendApplication;

public final class UploadPathUtils {

    private UploadPathUtils() {
    }

    public static Path resolveUploadRoot(String uploadDir) {
        Path configuredPath = Paths.get(uploadDir);

        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }

        return findProjectRoot().resolve(uploadDir).normalize();
    }

    private static Path findProjectRoot() {
        Path start = getApplicationLocation();
        Path current = start;

        while (current != null) {
            if (Files.exists(current.resolve("pom.xml"))
                    && Files.exists(current.resolve("src/main/java/com/bookingtoursonla/BackendApplication.java"))) {
                return current;
            }

            current = current.getParent();
        }

        return Paths.get("").toAbsolutePath().normalize();
    }

    private static Path getApplicationLocation() {
        try {
            Path location = Paths.get(BackendApplication.class
                    .getProtectionDomain()
                    .getCodeSource()
                    .getLocation()
                    .toURI())
                    .toAbsolutePath()
                    .normalize();

            return Files.isRegularFile(location) ? location.getParent() : location;
        } catch (URISyntaxException ex) {
            return Paths.get("").toAbsolutePath().normalize();
        }
    }
}
