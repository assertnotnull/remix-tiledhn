export default function Loading() {
  const amount = 20;

  return (
    <section className="bg-base-200">
      <div className="px-6 py-10 mx-auto">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
          {new Array(amount).fill(0).map((_, i) => (
            <div key={i} className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="skeleton h-14"></div>
                <div className="skeleton h-6"></div>
                <div className="skeleton h-12"></div>
                <div className="skeleton h-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
