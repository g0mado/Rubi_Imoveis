export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{
        background: 'linear-gradient(45deg, var(--ruby-700), var(--ruby-500))',
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
      }}
    >
      {/* Ruby gem shape using polygon clip-path */}
    </svg>
  );
}
