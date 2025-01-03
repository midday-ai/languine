import GithubSignIn from "./github-sign-in";

export default function Login() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <GithubSignIn />
    </div>
  );
}
