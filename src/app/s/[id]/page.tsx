export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="=">
      <p>subConfettichannel ID: {id}</p>
      {/* Your other page content */}
    </div>
  );
}
