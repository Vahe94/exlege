import type { CreateLeadInput } from '@exlege/types';
import { apiPost } from './client';

/** Submit the public contact form. Tenant is resolved server-side (DEFAULT_TENANT_SLUG). */
export function submitLead(input: CreateLeadInput): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/public/leads', input);
}
