import { EVENT_CONFIG } from '../data/eventData';

export interface Web3FormsResponse {
  success: boolean;
  message?: string;
}

export async function submitToWeb3Forms(fields: Record<string, string>): Promise<Web3FormsResponse> {
  const accessKey = EVENT_CONFIG.web3FormsKey.trim();
  if (!accessKey) {
    throw new Error('Falta configurar la Access Key de Web3Forms.');
  }

  const formData = new FormData();
  formData.append('access_key', accessKey);

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor de registro. Inténtalo de nuevo.');
  }

  const result = (await response.json()) as Web3FormsResponse;
  if (!result.success) {
    throw new Error(result.message || 'Error al enviar los datos.');
  }

  return result;
}
