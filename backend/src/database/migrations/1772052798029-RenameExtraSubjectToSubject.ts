import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameExtraSubjectToSubject1772052798029 implements MigrationInterface {
    name = 'RenameExtraSubjectToSubject1772052798029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints referencing extra_subject before renaming
        await queryRunner.query(`ALTER TABLE "student_subject" DROP CONSTRAINT IF EXISTS "FK_062fc6e4247d0fb1214244e45a4"`);
        await queryRunner.query(`ALTER TABLE "subject_assignment" DROP CONSTRAINT IF EXISTS "FK_84276dff1ca42c4047099d1d7ce"`);
        await queryRunner.query(`ALTER TABLE "extra_subject" DROP CONSTRAINT IF EXISTS "FK_82a6af4ad69f4c8dd1718e95d44"`);

        // Rename the table
        await queryRunner.query(`ALTER TABLE "extra_subject" RENAME TO "subject"`);

        // Rename the enum type
        await queryRunner.query(`ALTER TYPE "public"."extra_subject_subjectcategory_enum" RENAME TO "subject_subjectcategory_enum"`);

        // Rename the primary key constraint to match the new table name
        await queryRunner.query(`ALTER TABLE "subject" RENAME CONSTRAINT "PK_06da45b47c249db27815fd45246" TO "PK_12eee115462e38d62e5455fc054"`);

        // Re-add foreign keys pointing to the renamed table
        await queryRunner.query(`ALTER TABLE "subject" ADD CONSTRAINT "FK_34316b3504ab03883ad30bc39d3" FOREIGN KEY ("feeCategoryId") REFERENCES "fee_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject" ADD CONSTRAINT "FK_062fc6e4247d0fb1214244e45a4" FOREIGN KEY ("extraSubjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_assignment" ADD CONSTRAINT "FK_84276dff1ca42c4047099d1d7ce" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "subject_assignment" DROP CONSTRAINT IF EXISTS "FK_84276dff1ca42c4047099d1d7ce"`);
        await queryRunner.query(`ALTER TABLE "student_subject" DROP CONSTRAINT IF EXISTS "FK_062fc6e4247d0fb1214244e45a4"`);
        await queryRunner.query(`ALTER TABLE "subject" DROP CONSTRAINT IF EXISTS "FK_34316b3504ab03883ad30bc39d3"`);

        // Rename primary key back
        await queryRunner.query(`ALTER TABLE "subject" RENAME CONSTRAINT "PK_12eee115462e38d62e5455fc054" TO "PK_06da45b47c249db27815fd45246"`);

        // Rename enum type back
        await queryRunner.query(`ALTER TYPE "public"."subject_subjectcategory_enum" RENAME TO "extra_subject_subjectcategory_enum"`);

        // Rename table back
        await queryRunner.query(`ALTER TABLE "subject" RENAME TO "extra_subject"`);

        // Re-add foreign keys pointing to restored table name
        await queryRunner.query(`ALTER TABLE "extra_subject" ADD CONSTRAINT "FK_82a6af4ad69f4c8dd1718e95d44" FOREIGN KEY ("feeCategoryId") REFERENCES "fee_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject" ADD CONSTRAINT "FK_062fc6e4247d0fb1214244e45a4" FOREIGN KEY ("extraSubjectId") REFERENCES "extra_subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_assignment" ADD CONSTRAINT "FK_84276dff1ca42c4047099d1d7ce" FOREIGN KEY ("subjectId") REFERENCES "extra_subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
