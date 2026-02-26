import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOtherFeeNames1772087980605 implements MigrationInterface {
    name = 'RemoveOtherFeeNames1772087980605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fee_payment" DROP COLUMN "otherFeeNames"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fee_payment" ADD "otherFeeNames" character varying`);
    }

}
