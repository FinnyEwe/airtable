import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "~/server/auth";
import { AirtableLogo } from "./_components/AirtableLogo";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex justify-between w-full max-w-6xl items-center gap-12 px-8">
        {/* Left side - Sign-in Form */}
        <div className="flex w-full max-w-md flex-col items-center">
          {/* Logo */}
          <div className="mb-8">
            <AirtableLogo />
          </div>

          {/* Title */}
          <h1 className="mb-12 text-center text-4xl font-semibold text-gray-900">
            Sign in to Airtable
          </h1>

          {/* Sign-in Form Container */}
          <div className="w-full">
            {/* Email Input Section */}
            <div className="mb-6 w-full overflow-hidden rounded-xl bg-white shadow-sm">
              <form className="p-0">
                <div className="relative mb-4 block p-2">
                  <label
                    htmlFor="emailLogin"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="emailLogin"
                      name="email"
                      placeholder="Email address"
                      autoComplete="email"
                      disabled
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="mb-2 flex w-full items-center justify-center rounded-xl border-none bg-blue-600 px-4 py-3 text-base font-semibold text-white opacity-50 shadow-sm"
                >
                  <span className="truncate">Continue</span>
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center justify-center">
              <p className="text-lg text-gray-500">or</p>
            </div>

            {/* SSO Button (Disabled) */}
            <button
              type="button"
              disabled
              className="mb-3 flex h-10 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-3 text-gray-900 opacity-50 shadow-sm transition-all"
            >
              <span className="truncate">
                <p className="text-base">
                  Sign in with <span className="font-semibold">Single Sign On</span>
                </p>
              </span>
            </button>

            {/* Google Sign-in Button */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="mb-3 flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 18 18">
                    <path
                      d="M17.64,9.20454545 C17.64,8.56636364 17.5827273,7.95272727 17.4763636,7.36363636 L9,7.36363636 L9,10.845 L13.8436364,10.845 C13.635,11.97 13.0009091,12.9231818 12.0477273,13.5613636 L12.0477273,15.8195455 L14.9563636,15.8195455 C16.6581818,14.2527273 17.64,11.9454545 17.64,9.20454545 L17.64,9.20454545 Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M9,18 C11.43,18 13.4672727,17.1940909 14.9563636,15.8195455 L12.0477273,13.5613636 C11.2418182,14.1013636 10.2109091,14.4204545 9,14.4204545 C6.65590909,14.4204545 4.67181818,12.8372727 3.96409091,10.71 L0.957272727,10.71 L0.957272727,13.0418182 C2.43818182,15.9831818 5.48181818,18 9,18 L9,18 Z"
                      fill="#34A853"
                    />
                    <path
                      d="M3.96409091,10.71 C3.78409091,10.17 3.68181818,9.59318182 3.68181818,9 C3.68181818,8.40681818 3.78409091,7.83 3.96409091,7.29 L3.96409091,4.95818182 L0.957272727,4.95818182 C0.347727273,6.17318182 0,7.54772727 0,9 C0,10.4522727 0.347727273,11.8268182 0.957272727,13.0418182 L3.96409091,10.71 L3.96409091,10.71 Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M9,3.57954545 C10.3213636,3.57954545 11.5077273,4.03363636 12.4404545,4.92545455 L15.0218182,2.34409091 C13.4631818,0.891818182 11.4259091,0 9,0 C5.48181818,0 2.43818182,2.01681818 0.957272727,4.95818182 L3.96409091,7.29 C4.67181818,5.16272727 6.65590909,3.57954545 9,3.57954545 L9,3.57954545 Z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <p className="text-base">
                  Continue with <span className="font-semibold">Google</span>
                </p>
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600">
            New to Airtable?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>{" "}
            instead
          </p>
        </div>

        {/* Right side - Omni Image */}
        <div className="hidden w-[35%] max-w-2xl md:block">
          <img
            src="/omni_signin_large@2x.png"
            alt="Meet Omni, your AI collaborator for building custom apps"
            className="h-auto w-full hover:scale-[1.05] transition-all 0.1s"
          />
        </div>
      </div>
    </div>
  );
}
