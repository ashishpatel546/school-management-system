import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStudentDiscountId1772059196159 implements MigrationInterface {
    name = 'FixStudentDiscountId1772059196159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "student_discounts_id_seq" OWNED BY "student_discounts"."id"`);
        await queryRunner.query(`ALTER TABLE "student_discounts" ALTER COLUMN "id" SET DEFAULT nextval('"student_discounts_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_discounts" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "student_discounts_id_seq"`);
    }

}
