export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <p>subConfettichannel ID: {id}</p>
    </div>
  );
}
