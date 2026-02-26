import { MigrationInterface, QueryRunner } from "typeorm";

export class FeeDiscountTracking1772057288580 implements MigrationInterface {
    name = 'FeeDiscountTracking1772057288580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "FK_507eb8f1b506db767876cf403fd"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "FK_8b830cfe4aee4c2674955a1d1b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_507eb8f1b506db767876cf403f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b830cfe4aee4c2674955a1d1b"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_ca8aed07e61886260f2dd54eaba"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_da616399934a0304ab0b3652b1f" PRIMARY KEY ("studentId", "discountCategoryId", "id")`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD "createdOn" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD "updatedOn" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "discountNames" character varying`);
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "discountAmount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "baseFeeAmount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "otherFeeAmount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "otherFeeNames" character varying`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_da616399934a0304ab0b3652b1f"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_0a112986d8fb79996cff1e49c50" PRIMARY KEY ("discountCategoryId", "id")`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_0a112986d8fb79996cff1e49c50"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_492cd23db93f5875819608d3eae" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "FK_507eb8f1b506db767876cf403fd" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "FK_8b830cfe4aee4c2674955a1d1b9" FOREIGN KEY ("discountCategoryId") REFERENCES "discount_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "FK_8b830cfe4aee4c2674955a1d1b9"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "FK_507eb8f1b506db767876cf403fd"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_492cd23db93f5875819608d3eae"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_0a112986d8fb79996cff1e49c50" PRIMARY KEY ("discountCategoryId", "id")`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_0a112986d8fb79996cff1e49c50"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_da616399934a0304ab0b3652b1f" PRIMARY KEY ("studentId", "discountCategoryId", "id")`);
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "otherFeeNames"`);
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "otherFeeAmount"`);
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "baseFeeAmount"`);
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "discountAmount"`);
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "discountNames"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP COLUMN "updatedOn"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP COLUMN "createdOn"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP CONSTRAINT "PK_da616399934a0304ab0b3652b1f"`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "PK_ca8aed07e61886260f2dd54eaba" PRIMARY KEY ("studentId", "discountCategoryId")`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" DROP COLUMN "id"`);
        await queryRunner.query(`CREATE INDEX "IDX_8b830cfe4aee4c2674955a1d1b" ON "student_discounts_discount_category" ("discountCategoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_507eb8f1b506db767876cf403f" ON "student_discounts_discount_category" ("studentId") `);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "FK_8b830cfe4aee4c2674955a1d1b9" FOREIGN KEY ("discountCategoryId") REFERENCES "discount_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_discounts_discount_category" ADD CONSTRAINT "FK_507eb8f1b506db767876cf403fd" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
