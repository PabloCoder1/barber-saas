'use client';

import { useState } from 'react';

interface ReviewFormProps {
  appointmentId: string;
  barberName: string;
  onSuccess: () => void;
}

export default function ReviewForm({ appointmentId, barberName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Selecione uma nota.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Erro ao enviar avaliação.');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const labels = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente!'];
  const activeRating = hovered || rating;

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <p className="text-sm text-zinc-400 mb-3">
        Como foi seu atendimento com <strong className="text-white">{barberName}</strong>?
      </p>

      {/* ESTRELAS */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                star <= activeRating ? 'text-yellow-400' : 'text-zinc-700'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
        {activeRating > 0 && (
          <span className="ml-2 text-sm font-medium text-yellow-400">
            {labels[activeRating]}
          </span>
        )}
      </div>

      {/* COMENTÁRIO OPCIONAL */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário opcional..."
        maxLength={300}
        rows={2}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-500 transition-colors resize-none mb-3"
      />

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isLoading || rating === 0}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold py-2.5 rounded-xl transition-colors text-sm"
      >
        {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}
