'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewList from './ReviewList';
import ReviewModal from './ReviewModal';

export default function RecentReviews({ reviews: initial, tone }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [selected, setSelected] = useState(null);

  function onSaved(updated) {
    setReviews((list) => list.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    router.refresh();
  }

  return (
    <>
      <ReviewList reviews={reviews} onSelect={setSelected} compact />
      {selected && (
        <ReviewModal
          review={selected}
          defaultTone={tone}
          onClose={() => setSelected(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
