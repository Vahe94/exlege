'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createLeadSchema, type CreateLeadInput } from '@exlege/types';
import { Container } from '../layout/container';
import { SectionHeading } from '../ui/section-heading';
import { Button } from '../ui/button';
import { submitLead } from '@/lib/api/leads';

type Field = 'name' | 'phone' | 'email' | 'message';
type Status = 'idle' | 'submitting' | 'success' | 'error';

const FIELDS: Field[] = ['name', 'phone', 'email', 'message'];
const REQUIRED: Field[] = ['name', 'phone'];

const inputCls =
  'w-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface ' +
  'outline-none transition-colors focus:border-primary';

export function Contact() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const data = new FormData(e.currentTarget);
    // Empty optionals must be undefined, not '' (email() would reject '').
    const raw: Record<Field, string | undefined> = {
      name: String(data.get('name') ?? '').trim() || undefined,
      phone: String(data.get('phone') ?? '').trim() || undefined,
      email: String(data.get('email') ?? '').trim() || undefined,
      message: String(data.get('message') ?? '').trim() || undefined,
    };

    const parsed = createLeadSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<Field, boolean>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (key) fieldErrors[key] = true;
      }
      setErrors(fieldErrors);
      return;
    }

    setStatus('submitting');
    try {
      await submitLead(parsed.data as CreateLeadInput);
      setStatus('success');
      e.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-surface-container-low py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-on-surface-variant">
              {t('subtitle')}
            </p>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-start justify-center border border-secondary bg-surface-container-lowest p-10">
              <p className="font-display text-2xl font-semibold text-primary">
                {t('successTitle')}
              </p>
              <p className="mt-3 text-on-surface-variant">{t('successBody')}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {FIELDS.map((field) =>
                field === 'message' ? (
                  <div key={field}>
                    <label htmlFor={field} className="mb-2 block text-sm font-semibold text-primary">
                      {t(`fields.${field}`)}
                    </label>
                    <textarea
                      id={field}
                      name={field}
                      rows={4}
                      className={`${inputCls} resize-y ${errors[field] ? 'border-error' : ''}`}
                      aria-invalid={errors[field] ? true : undefined}
                    />
                  </div>
                ) : (
                  <div key={field}>
                    <label htmlFor={field} className="mb-2 block text-sm font-semibold text-primary">
                      {t(`fields.${field}`)}
                      {REQUIRED.includes(field) ? (
                        <span className="text-secondary"> *</span>
                      ) : null}
                    </label>
                    <input
                      id={field}
                      name={field}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      className={`${inputCls} ${errors[field] ? 'border-error' : ''}`}
                      aria-invalid={errors[field] ? true : undefined}
                    />
                    {errors[field] ? (
                      <p className="mt-1.5 text-sm text-error">{t(`errors.${field}`)}</p>
                    ) : null}
                  </div>
                ),
              )}

              {status === 'error' ? (
                <p className="text-sm text-error">{t('submitError')}</p>
              ) : null}

              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                {status === 'submitting' ? t('submitting') : t('submit')}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
