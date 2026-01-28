import PinnedRepoCard from "./PinnedRepoCard";

const PinnedRepos = () => {
  return (
    <section className="px-4 mt-6">
      <h2 className="mb-4 font-semibold">Pinned</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PinnedRepoCard name="Real-Estate" desc="Web build with React JS" />
        <PinnedRepoCard name="Delivery" desc="Delivery system frontend" />
        <PinnedRepoCard name="Employ" desc="Employee management UI" />
      </div>
    </section>
  );
};

export default PinnedRepos;
