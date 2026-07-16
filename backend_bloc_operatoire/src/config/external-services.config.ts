import { registerAs } from '@nestjs/config';

export default registerAs('externalServices', () => {
  const chuId = process.env.CHU_ID;
  const accueilApiUrl = process.env.ACCUEIL_API_URL;

  if (!chuId) throw new Error('CHU_ID manquant dans les variables d\'environnement');
  if (!accueilApiUrl) throw new Error('ACCUEIL_API_URL manquant dans les variables d\'environnement');

  return {
    chuId,
    serviceId: process.env.SERVICE_ID,
    accueilApiUrl,
    serviceChuApiUrl: process.env.SERVICE_CHU_API_URL,
    endoscopieApiUrl: process.env.ENDOSCOPIE_API_URL,
    endoscopieServiceId: process.env.ENDOSCOPIE_SERVICE_ID,
    notificationOrigineUrl: process.env.NOTIFICATION_ORIGINE_URL,
    prescriptionApiUrl: process.env.PRESCRIPTION_API_URL,
    notificationApiUrl: process.env.NOTIFICATION_API_URL,
  };
});
