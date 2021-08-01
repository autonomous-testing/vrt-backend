# Migration `20210705154453-baseline-author`

This migration has been generated by Pavlo Strunkin <pashidlos@gmail.com> at 7/5/2021, 6:44:53 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "Baseline" ADD COLUMN     "userId" TEXT

ALTER TABLE "Baseline" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210612140950-limit-build-number..20210705154453-baseline-author
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
   id         String    @id @default(uuid())
@@ -102,9 +102,11 @@
   testVariationId String
   testVariation   TestVariation @relation(fields: [testVariationId], references: [id])
   testRunId       String?
   testRun         TestRun?      @relation(fields: [testRunId], references: [id])
-  updatedAt       DateTime      @updatedAt
+  userId          String?
+  user            User?         @relation(fields: [userId], references: [id])
+  updatedAt       DateTime      @updatedAt 
   createdAt       DateTime      @default(now())
 }
 model User {
@@ -115,8 +117,9 @@
   lastName  String?
   apiKey    String   @unique
   isActive  Boolean  @default(true)
   builds    Build[]
+  baselines Baseline[]
   updatedAt DateTime @updatedAt
   createdAt DateTime @default(now())
 }
```

