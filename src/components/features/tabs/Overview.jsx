import ContributionGraph from "@common/ContributionGraph";
import PinnedRepos from "@features/PinnedRepos";

const Overview = () => {
  return (
    <>
      <PinnedRepos  username="momanamjad"/>
      <ContributionGraph/>
    </>
  );
};

export default Overview;
