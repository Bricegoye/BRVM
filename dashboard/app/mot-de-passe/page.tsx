"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/auth-client";

export default function PasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [checking, setChecking] = useState(true);
  const [canUpdate, setCanUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function checkRecovery() {
      const params = new URLSearchParams(window.location.search);
      try {
        if (params.has("erreur")) {
          if (active) setErrorMessage("Le lien est invalide ou expiré. Demande un nouvel e-mail ci-dessous.");
          return;
        }
        if (params.get("mode") !== "modifier") return;
        const client = createBrowserSupabaseClient();
        const { data: { user }, error } = await client.auth.getUser();
        if (!active) return;
        if (error || !user) {
          setErrorMessage("La session de récupération est indisponible. Demande un nouveau lien.");
        } else {
          setCanUpdate(true);
        }
      } catch {
        if (active) setErrorMessage("Impossible de vérifier la session. Réessaie dans quelques instants.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkRecovery();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setErrorMessage(null);
    setMessage(null);
    if (canUpdate && password !== confirmation) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const client = createBrowserSupabaseClient();
      if (canUpdate) {
        const { data: { user }, error: sessionError } = await client.auth.getUser();
        if (sessionError || !user) {
          setCanUpdate(false);
          setErrorMessage("Ta session a expiré. Demande un nouveau lien.");
          return;
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          setErrorMessage("Modification refusée : " + error.message);
          return;
        }
        setPassword("");
        setConfirmation("");
        setDone(true);
        setMessage("Ton nouveau mot de passe est enregistré.");
      } else {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/recuperation`,
        });
        if (error) {
          setErrorMessage("Envoi impossible. Patiente un instant avant de réessayer. Si le problème persiste, vérifie la configuration e-mail Supabase.");
          return;
        }
        setMessage("Si cette adresse correspond à un compte, un e-mail de récupération sera envoyé. Vérifie aussi les courriers indésirables.");
      }
    } catch {
      setErrorMessage("L’opération n’a pas pu aboutir. Vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60";
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-base font-semibold text-blue-700">BRVM Analytics</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">{canUpdate ? "Nouveau mot de passe" : "Mot de passe oublié"}</h1>
        {checking ? <p role="status" className="mt-5 text-lg text-slate-700">Vérification en cours…</p> : !done && (
          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            {canUpdate ? (
              <>
                <div>
                  <label htmlFor="password" className="block text-lg font-semibold text-slate-800">Nouveau mot de passe</label>
                  <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required disabled={loading} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
                  <p className="mt-2 text-base text-slate-600">Au moins 12 caractères, selon les règles de sécurité de ton compte.</p>
                </div>
                <div>
                  <label htmlFor="confirmation" className="block text-lg font-semibold text-slate-800">Confirmer le mot de passe</label>
                  <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} required disabled={loading} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-slate-800">Adresse e-mail du compte</label>
                <input id="email" name="email" type="email" autoComplete="email" required disabled={loading} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
                <p className="mt-3 text-base leading-7 text-slate-600">Ouvre le lien reçu dans le même navigateur que celui utilisé pour cette demande.</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 px-5 py-4 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? "Traitement en cours…" : canUpdate ? "Enregistrer le mot de passe" : "Recevoir le lien par e-mail"}</button>
          </form>
        )}
        {errorMessage && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-base leading-7 text-red-800">{errorMessage}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base leading-7 text-emerald-900">{message}</p>}
        <Link href={done ? "/fondamentaux-preview" : "/connexion"} className="mt-6 inline-block text-lg font-semibold text-blue-700 underline underline-offset-4">{done ? "Accéder aux fondamentaux" : "Retour à la connexion"}</Link>
      </section>
    </main>
  );
}
