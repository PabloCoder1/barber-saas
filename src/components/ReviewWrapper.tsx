'use client';

import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';

interface ReviewWrapperProps {
  appointmentId: string;
  barberName: string;
}

export default function ReviewWrapper({ appointmentId, barberName }: ReviewWrapperProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-emerald-400 text-sm font-medium">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Avaliação enviada! Obrigado.
      </div>
    );
  }

  return (
    <ReviewForm
      appointmentId={appointmentId}
      barberName={barberName}
      onSuccess={() => setSubmitted(true)}
    />
  );
}
