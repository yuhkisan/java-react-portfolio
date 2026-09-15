-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'analyzing',
    "errorMessage" TEXT,
    "pkgCount" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isDirect" BOOLEAN NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Package_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackageDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dependerId" TEXT NOT NULL,
    "dependeeId" TEXT NOT NULL,
    CONSTRAINT "PackageDependency_dependerId_fkey" FOREIGN KEY ("dependerId") REFERENCES "Package" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PackageDependency_dependeeId_fkey" FOREIGN KEY ("dependeeId") REFERENCES "Package" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "severity" TEXT NOT NULL,
    "cve" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fixedIn" TEXT,
    "url" TEXT,
    "packageId" TEXT NOT NULL,
    CONSTRAINT "Vulnerability_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_projectId_name_version_key" ON "Package"("projectId", "name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PackageDependency_dependerId_dependeeId_key" ON "PackageDependency"("dependerId", "dependeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Vulnerability_packageId_key" ON "Vulnerability"("packageId");
