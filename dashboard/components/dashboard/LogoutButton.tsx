"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/auth-client";

export default function LogoutButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      const client = createBrowserSupabaseClient();

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setConnected(Boolean(session));
      });

      return () => subscription.unsubscribe();
    } catch {
      return;
    }
  }, []);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const client = createBrowserSupabaseClient();

      const { error } = await client.auth.signOut({
        scope: "local",
      });

      if (error) {
        setErrorMessage(
          "Déconnexion impossible. Réessaie dans quelques instants."
        );
        return;
      }

      // Recharge complètement la page après la déconnexion.
      window.location.replace("/connexion");
    } catch {
      setErrorMessage(
        "La déconnexion n’a pas pu aboutir. Vérifie ta connexion internet."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!connected && !loading && !errorMessage) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="
          rounded-xl
          border border-slate-300
          bg-white
          px-5 py-3
          text-lg font-semibold text-slate-800
          shadow-sm
          hover:bg-slate-100
          focus:outline-none
          focus:ring-2
          focus:ring-blue-600
          focus:ring-offset-2
          disabled:cursor-wait
          disabled:opacity-60
        "
      >
        {loading ? "Déconnexion en cours…" : "Se déconnecter"}
      </button>

      {errorMessage && (
        <p
          role="alert"
          className="
            max-w-lg
            rounded-xl
            border border-red-200
            bg-red-50
            p-4
            text-base leading-7 text-red-800
          "
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}