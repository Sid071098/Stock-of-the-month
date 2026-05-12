import LoginLanding from "./components/LoginLanding";

export default function LandingPage({
  searchParams
}: {
  searchParams?: { subscribe?: string };
}) {
  return <LoginLanding subscribeRequired={searchParams?.subscribe === "required"} />;
}
