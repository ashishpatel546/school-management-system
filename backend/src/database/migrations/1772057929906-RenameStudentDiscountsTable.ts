import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameStudentDiscountsTable1772057929906 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "student_discounts" CASCADE`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" RENAME TO "student_discounts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_discounts" RENAME TO "student_discounts_discount_category"`);
    }

}
