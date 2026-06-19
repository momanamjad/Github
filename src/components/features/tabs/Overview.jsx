import ContributionGraph from "@common/ContributionGraph";
import PinnedRepos from "@features/PinnedRepos";
import { useParams, useSearchParams } from "react-router-dom";
import Followers from "./Followers";
import Following from "./Following";

const Overview = () => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  if (tab === "followers") {
    return <Followers />;
  }

  if (tab === "following") {
    return <Following />;
  }

  return (
    <>
      <PinnedRepos username={username} />
      <ContributionGraph username={username} />
    </>
  );
};

export default Overview;
