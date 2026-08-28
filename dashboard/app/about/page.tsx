import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AboutPage() {
  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
          À propos de BRVM Analytics
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          BRVM Analytics est un projet d’analyse de marché construit à partir
          des données publiques de la Bourse Régionale des Valeurs Mobilières.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Objectif */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Objectif du projet
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            L’objectif est de collecter, structurer et analyser les données
            quotidiennes de la BRVM afin de construire progressivement une
            plateforme de compréhension du marché.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Le projet commence par la visualisation des données du marché, puis
            évoluera vers des indicateurs historiques, des comparaisons entre
            actions, des scores de marché, des modèles prédictifs et des
            analyses assistées par intelligence artificielle.
          </p>
        </div>

        {/* Données */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Données collectées
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>• Sociétés cotées</p>
            <p>• Cotations quotidiennes des actions</p>
            <p>• Indices principaux et sectoriels</p>
            <p>• Activité globale du marché</p>
            <p>• Top 5 et Flop 5 de chaque séance</p>
          </div>
        </div>

        {/* Architecture */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Architecture
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">
                Collecte :
              </span>{" "}
              Python
            </p>

            <p>
              <span className="font-semibold text-slate-900">
                Automatisation :
              </span>{" "}
              GitHub Actions
            </p>

            <p>
              <span className="font-semibold text-slate-900">
                Base de données :
              </span>{" "}
              Supabase / PostgreSQL
            </p>

            <p>
              <span className="font-semibold text-slate-900">
                Dashboard :
              </span>{" "}
              Next.js + TypeScript + Tailwind
            </p>

            <p>
              <span className="font-semibold text-slate-900">
                Analyse prédictive :
              </span>{" "}
              Python, Machine Learning et intelligence artificielle
            </p>
          </div>
        </div>

        {/* Vision */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Vision
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            À mesure que l’historique grandira, la plateforme calculera
            automatiquement les performances sur 7, 30 et 90 jours, la
            volatilité, les tendances, l’évolution des volumes et la
            surperformance des actions par rapport au marché.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Une couche prédictive pourra ensuite exploiter ces données pour
            détecter des signaux, estimer les tendances probables et évaluer
            les risques de hausse ou de baisse.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            L’intelligence artificielle viendra compléter cette analyse pour
            expliquer les mouvements du marché, interpréter les résultats des
            modèles prédictifs et produire des synthèses compréhensibles
            facilitant la prise de décision.
          </p>
        </div>
      </div>

      {/* Avertissement */}

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">
          Important
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          BRVM Analytics est un outil d’analyse et d’apprentissage. Les
          tendances et probabilités éventuellement produites ne garantissent
          pas l’évolution future du marché. La plateforme ne constitue ni un
          conseil financier ni une recommandation d’investissement.
        </p>
      </div>
    </DashboardShell>
  );
}