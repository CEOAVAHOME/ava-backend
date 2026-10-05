export default function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} stelle su 5`}>
      {'★'.repeat(rating)}
      <span className="off">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}
