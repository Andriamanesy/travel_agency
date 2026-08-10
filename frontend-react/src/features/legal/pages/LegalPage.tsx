import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Retour à l'accueil
        </Link>
        
        <h1 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">
          Conditions Générales d'Utilisation (CGU)
        </h1>
        <p className="mt-2 text-xs font-medium text-slate-400">
          Date de dernière mise à jour : 10 août 2026
        </p>

        <div className="mt-8 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Objet et Champ d'Application</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») ont pour objet de définir les modalités et conditions d'utilisation des services proposés, ainsi que de définir les droits et obligations des parties dans ce cadre. Le présent document s'applique à tout utilisateur naviguant ou utilisant les services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Acceptation des Conditions</h2>
            <p>
              L'accès et l'utilisation de la plateforme impliquent l'acceptation sans réserve des présentes CGU par l'utilisateur. En accédant au site ou aux services, l'utilisateur reconnait avoir pris connaissance des présentes et s'engage à les respecter.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Accès aux Services</h2>
            <p>
              Le service est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Tous les coûts afférents à l'accès, que ce soit les frais matériels, de logiciels ou d'accès à Internet, sont exclusivement à la charge de l'utilisateur.
            </p>
            <p>
              La plateforme met en œuvre tous les moyens mis à sa disposition pour assurer un accès de qualité à ses services, mais n'est soumise à aucune obligation de y parvenir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Propriété Intellectuelle</h2>
            <p>
              Tous les contenus présents sur la plateforme (textes, graphiques, logos, icônes, images, clips audio ou vidéo, logiciels) sont la propriété exclusive de l'éditeur ou de ses partenaires et sont protégés par les lois nationales et internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est formellement interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Protection des Données Personnelles</h2>
            <p>
              Conformément à la réglementation en vigueur relative à la protection des données personnelles, l'éditeur s'engage à garantir la confidentialité et la sécurité des informations recueillies auprès des utilisateurs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. Limitation de Responsabilité</h2>
            <p>
              Les informations diffusées sur la plateforme sont fournies à titre indicatif. L'éditeur ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des fonctionnalités ou de la présence de virus sur son site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">7. Modification des CGU</h2>
            <p>
              L'éditeur se réserve le droit de modifier unilatéralement et à tout moment le contenu des présentes CGU. L'utilisateur est invité à les consulter régulièrement pour se tenir informé des éventuels changements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">8. Droit Applicable et Juridiction Compétente</h2>
            <p>
              Les présentes CGU sont régies par le droit en vigueur. En cas de litige né de l'interprétation ou de l'exécution des présentes, et à défaut d'accord amiable, les tribunaux compétents seront saisis pour régler le différend.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Retour à l'accueil
        </Link>
        
        <h1 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">
          Politique de Confidentialité
        </h1>
        <p className="mt-2 text-xs font-medium text-slate-400">
          Date de dernière mise à jour : 10 août 2026
        </p>

        <div className="mt-8 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Introduction et Champ d'Application</h2>
            <p>
              La protection de vos données personnelles est une priorité pour nous. Cette politique de confidentialité détaille la manière dont nous collectons, utilisons et protégeons vos informations personnelles lors de l'utilisation de notre plateforme.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">2. Collecte et Finalité des Données Personnelles</h2>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">5.1 Collecte des données</h3>
              <p>Les informations collectées lors de l'utilisation des services peuvent inclure :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Les données d'identification (nom, prénom, adresse e-mail) fournies lors de l'inscription ou de formulaires de contact.</li>
                <li>Les données de connexion et de navigation (adresse IP, journaux de logs, cookies).</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">5.2 Finalité du traitement</h3>
              <p>Les données collectées font l'objet d'un traitement informatique ayant pour finalités :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>La gestion, l'accès et l'utilisation des services.</li>
                <li>L'amélioration de l'expérience utilisateur et l'optimisation de la plateforme.</li>
                <li>Le respect des obligations légales et réglementaires.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Droits des Utilisateurs</h2>
            <p>
              Conformément aux lois applicables, l'utilisateur dispose d'un droit d'accès, de rectification, de portabilité et de suppression de ses données personnelles, ainsi que d'un droit d'opposition à leur traitement. Pour exercer ces droits, l'utilisateur peut adresser une demande par e-mail.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Sécurité des Données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées afin de protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}