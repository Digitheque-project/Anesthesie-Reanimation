'use client';

import PrescriptionModule from '@/features/prescription/PrescriptionModule';

interface PrescriptionAccueilTabProps {
	patientId: string;
}

export function PrescriptionAccueilTab({ patientId }: PrescriptionAccueilTabProps) {
	return <PrescriptionModule patientId={patientId} />;
}

export default PrescriptionAccueilTab;
