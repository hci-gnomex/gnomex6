# GNomEx6 Project Guide

## Project Overview

**GNomEx6** is a genomic LIMS (Laboratory Information Management System) and data repository used by core facilities to manage experiments, analysis, and data delivery. The system supports multiple sequencing and experimental platforms including Illumina HiSeq, MiSeq, Sanger sequencing, microarrays, and more.

**Architecture:**
- Backend: Java (Tomcat servlet container)
- Frontend: Angular (migrated from Adobe Flex)
- Database: SQL Server (MySQL also supported)
- Build: Gradle
- Version: 6.26.12

## Repository Structure

```
gnomex6/
├── src/                          # Java backend source code
├── gnomex_ng/                    # Angular frontend application
├── sql/                          # Database scripts and migrations
├── scripts/                      # Deployment and utility scripts
├── config/                       # Configuration files
├── lib/                          # Java library dependencies
├── libEnv/                       # Environment-specific libraries
├── gnomex_tomcat_support/        # Tomcat support utilities (subproject)
├── gnomex_crypt/                 # Encryption utilities (subproject)
├── fastDataTransfer/             # FDT transfer tools
├── UCSCExecutables/              # UCSC genome browser executables
├── build.gradle                  # Main Gradle build configuration
├── build.xml                     # Legacy Ant build script
└── META-INF/                     # Web application metadata
```

## Key Technologies

- **Java 17** - Backend application language
- **Hibernate 5** - ORM framework
- **JAX-RS / RESTEasy** - REST API framework
- **Apache Tomcat 9** - Application server
- **Angular** - Frontend framework (TypeScript/Webpack)
- **Gradle** - Build automation
- **Apache Shiro** - Security framework
- **AWS SDK** - S3 integration
- **MySQL / SQL Server** - Database options

## Build Commands

### Main Build Tasks

The project uses Gradle with custom build tasks prefixed with `gnomex`:

```bash
# Windows development build (quick - no webpack build)
./gradlew gnomexWindowsWDS

# Windows Tomcat deployment
./gradlew gnomexWindowsTomcat

# Linux Tomcat deployment
./gradlew gnomexLinuxTomcat

# Open source distribution
./gradlew gnomexOpensource
```

### Individual Tasks

```bash
# Clean and build WAR
./gradlew clean war

# Build Angular frontend
./gradlew :gnomex_ng:buildWebpackDevTomcat

# Build subproject JARs
./gradlew :gnomex_crypt:jar
./gradlew :gnomex_tomcat_support:jar

# Copy to Tomcat
./gradlew copyWar
```

## Database Configuration

The project supports both SQL Server and MySQL:

- **SQL Server** (default): Uses `SQLServerDialect` in Hibernate config
- **MySQL**: Switch dialect using `makeMySQL` task

Configuration location: `src/main/resources/hibernate.tomcat.cfg.xml`

## Development Setup

### Prerequisites

1. Java 17 JDK
2. Gradle (wrapper included)
3. Node.js and npm (for Angular frontend)
4. Apache Tomcat 9
5. SQL Server or MySQL database

### Configuration Files

Key configuration files to review:
- `build.properties` - Build configuration properties
- `src/main/webapp/WEB-INF/shiro.ini` - Security configuration
- `src/main/resources/hibernate.tomcat.cfg.xml` - Database configuration
- `gnomex_ng/webpack.config.js` - Frontend build configuration

### Environment Variables

Set in `build.properties`:
- `gnomexServerHome` - Tomcat installation directory
- `gnomexDeployDir` - Deployment subdirectory (typically `webapps`)

## Project Modules

### Main Application (`src/`)
Java backend with REST services, business logic, and data access layers.

### Angular Frontend (`gnomex_ng/`)
Modern Angular application that replaced the legacy Adobe Flex interface. Built with Webpack.

### Encryption Module (`gnomex_crypt/`)
Handles cryptographic operations for secure data handling.

### Tomcat Support (`gnomex_tomcat_support/`)
Custom Tomcat realm and authentication support libraries.

### Fast Data Transfer (`fastDataTransfer/`)
FDT (Fast Data Transfer) implementation for efficient file transfers.

## Common Development Tasks

### Building for Local Development

```bash
# Quick build without Angular webpack (faster for backend changes)
./gradlew gnomexWindowsWDS

# Full build with Angular compilation
./gradlew gnomexWindowsTomcat
```

### Working with Angular Frontend

```bash
cd gnomex_ng
npm install                           # Install dependencies
npm run build                         # Build for production
```

### Database Switching

```bash
# Switch to MySQL
./gradlew makeMySQL

# Switch to SQL Server
./gradlew makeSQLServer
```

## Security Considerations

- Apache Shiro manages authentication and authorization
- Configuration differs between Windows (`C:/properties`) and Linux (`/properties`)
- DuoWeb integration for two-factor authentication
- XSRF protection via servlet filters
- CORS and cache control filters included

## Integration Points

- **AWS S3** - File storage integration
- **Apache Lucene** - Search functionality
- **rsync4j** - File synchronization
- **UCSC Genome Browser** - Data track serving
- **RESTful APIs** - External system integration

## Deployment Artifacts

The build produces:
- `gnomex.war` - Main web application
- `gnomex.jar` - Core Java classes
- `gnomexclient.jar` - HTTP client library
- `gnomex_crypt.jar` - Encryption utilities
- `gnomex_tomcat_support.jar` - Tomcat support

## Known Configuration Patterns

### Shiro Configuration Adjustment
The build automatically adjusts `shiro.ini` for Windows vs Linux:
- Windows: Uses `C:/properties` path
- Linux: Uses `/properties` path

### Platform-Specific Builds
Different Gradle tasks handle platform differences in file paths and configurations.

## Testing

Testing infrastructure uses standard Java testing frameworks. Test execution can be integrated into the build process.

## Documentation

Additional documentation available in:
- `README.md` - Main project documentation
- `README_INSTALL.txt` - Installation instructions
- `README_UPGRADE.txt` - Upgrade procedures
- `doc/` - Extended documentation
- `LICENSE.txt` - MIT License

## Git Workflow

Current branch: `funny-cannon`
Main branch: `master`

This is a git worktree. The main repository is at `C:\temp\20251204\20210903g6\gnomex6`.

## Support and Resources

- Original Flex version: https://github.com/hci-gnomex/gnomex
- Maven artifacts: HCI internal Artifactory
- Built by: u0974549
- Current version: 6.26.12 (07/06/2025)
