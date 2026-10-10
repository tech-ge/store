export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-display text-2xl text-navy mb-4">Order {params.id}</h1>
    </div>
  )
}
