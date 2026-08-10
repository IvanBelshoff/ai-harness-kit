export function Button({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="mt-4 rounded-lg bg-primary px-4 py-2 text-white font-medium"
    >
      {label}
    </button>
  )
}
