import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonnelInterventionToProtocoleOperatoire1755281400000
  implements MigrationInterface
{
  name = 'AddPersonnelInterventionToProtocoleOperatoire1755281400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "protocoles_operatoires" ADD COLUMN "personnelIntervention" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "protocoles_operatoires" DROP COLUMN "personnelIntervention"`,
    );
  }
}
