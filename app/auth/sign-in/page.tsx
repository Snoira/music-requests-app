import { signInWithSpotify } from './actions';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form action={signInWithSpotify}>
        <button
          type="submit"
          className="rounded-md bg-green-500 px-4 py-2 font-medium text-white"
        >
          Sign in with Spotify
        </button>
      </form>
    </main>
  );
}
