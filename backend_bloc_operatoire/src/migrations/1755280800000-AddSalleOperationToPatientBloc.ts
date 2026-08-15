import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalleOperationToPatientBloc1755280800000
  implements MigrationInterface
{
  name = 'AddSalleOperationToPatientBloc1755280800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients_bloc" ADD COLUMN "salleOperation" character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients_bloc" DROP COLUMN "salleOperation"`,
    );
  }
}
