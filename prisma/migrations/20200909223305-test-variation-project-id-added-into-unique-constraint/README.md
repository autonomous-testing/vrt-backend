# Migration `20200909223305-test-variation-project-id-added-into-unique-constraint`

This migration has been generated by Pavel Strunkin at 9/10/2020, 12:33:05 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX "public"."TestVariation.name_browser_device_os_viewport_branchName_unique"

CREATE UNIQUE INDEX "TestVariation.projectId_name_browser_device_os_viewport_branchName_unique" ON "public"."TestVariation"("projectId","name","browser","device","os","viewport","branchName")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200812213545-build-run-status..20200909223305-test-variation-project-id-added-into-unique-constraint
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Build {
   id         String    @default(uuid()) @id
@@ -80,9 +80,9 @@
   comment      String?
   updatedAt    DateTime   @updatedAt
   createdAt    DateTime   @default(now())
-  @@unique([name, browser, device, os, viewport, branchName])
+  @@unique([projectId, name, browser, device, os, viewport, branchName])
 }
 model Baseline {
   id              String        @default(uuid()) @id
```

