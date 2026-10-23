"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createBrowserSupabaseClient,
} from "@/lib/supabase/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const client = createBrowserSupabaseClient();

      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          "Connexion impossible. Vérifie ton adresse e-mail et ton mot de passe."
        );
        return;
      }

      setPassword("");

      // La prévisualisation reste utilisée jusqu'au
      // branchement de la lecture Supabase à l'étape suivante.
      router.replace("/fondamentaux-preview");
      router.refresh();
    } catch {
      setErrorMessage(
        "La connexion n'a pas pu aboutir. Vérifie ta connexion internet et la configuration Supabase."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-base font-semibold text-blue-700">
          BRVM Analytics
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Connexion
        </h1>

        <p className="mt-4 text-lg leading-7 text-slate-600">
          Connecte-toi avec le compte créé pour ton espace
          d’analyse fondamentale.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-base font-semibold text-slate-800"
            >
              Adresse e-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={loading}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-semibold text-slate-800"
            >
              Mot de passe
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-base leading-7 text-red-800"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 px-5 py-4 text-lg font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}