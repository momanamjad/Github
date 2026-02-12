import ContributionGraph from "@common/ContributionGraph";
import PinnedRepos from "@features/PinnedRepos";
import { useParams } from "react-router-dom";

const Overview = () => {
  const { username } = useParams();

  return (
    <>
      <PinnedRepos username={username} />
      <ContributionGraph username={username} />
    </>
  );
};

export default Overview;
