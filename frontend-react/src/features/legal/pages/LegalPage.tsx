// src/features/legal/pages/LegalPage.tsx
import React from 'react';

export const LegalPage: React.FC = () => {
    return (
        <main className="max-w-4xl mx-auto px-4 py-12 bg-white text-gray-800">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Conditions Générales d'Utilisation et Politique de Confidentialité
            </h1>
            <p className="text-sm text-gray-500 pb-6 border-b border-gray-200 mb-8">
                <em>Date de dernière mise à jour : 10 août 2026</em>
            </p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Objet et Champ d'Application</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») ont pour objet de définir les modalités et conditions d'utilisation des services proposés, ainsi que de définir les droits et obligations des parties dans ce cadre. Le présent document s'applique à tout utilisateur naviguant ou utilisant les services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Acceptation des Conditions</h2>
                    <p className="text-gray-600 leading-relaxed">
                        L'accès et l'utilisation de la plateforme impliquent l'acceptation sans réserve des présentes CGU par l'utilisateur. En accédant au site ou aux services, l'utilisateur reconnait avoir pris connaissance des présentes et s'engage à les respecter.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Accès aux Services</h2>
                    <p className="text-gray-600 leading-relaxed mb-2">
                        Le service est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Tous les coûts afférents à l'accès, que ce soit les frais matériels, de logiciels ou d'accès à Internet, sont exclusivement à la charge de l'utilisateur.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        La plateforme met en œuvre tous les moyens mis à sa disposition pour assurer un accès de qualité à ses services, mais n'est soumise à aucune obligation de y parvenir.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Propriété Intellectuelle</h2>
                    <p className="text-gray-600 leading-relaxed mb-2">
                        Tous les contenus présents sur la plateforme (textes, graphiques, logos, icônes, images, clips audio ou vidéo, logiciels) sont la propriété exclusive de l'éditeur ou de ses partenaires et sont protégés par les lois nationales et internationales relatives à la propriété intellectuelle.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est formellement interdite, sauf autorisation écrite préalable.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Protection des Données Personnelles (Politique de Confidentialité)</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Conformément à la réglementation en vigueur relative à la protection des données personnelles, l'éditeur s'engage à garantir la confidentialité et la sécurité des informations recueillies auprès des utilisateurs.
                    </p>

                    <h3 className="text-lg font-medium text-gray-700 mb-2">5.1 Collecte des données</h3>
                    <p className="text-gray-600 mb-2">Les informations collectées lors de l'utilisation des services peuvent inclure :</p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                        <li>Les données d'identification (nom, prénom, adresse e-mail) fournies lors de l'inscription ou de formulaires de contact.</li>
                        <li>Les données de connexion et de navigation (adresse IP, journaux de logs, cookies).</li>
                    </ul>

                    <h3 className="text-lg font-medium text-gray-700 mb-2">5.2 Finalité du traitement</h3>
                    <p className="text-gray-600 mb-2">Les données collectées font l'objet d'un traitement informatique ayant pour finalités :</p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                        <li>La gestion, l'accès et l'utilisation des services.</li>
                        <li>L'amélioration de l'expérience utilisateur et l'optimisation de la plateforme.</li>
                        <li>Le respect des obligations légales et réglementaires.</li>
                    </ul>

                    <h3 className="text-lg font-medium text-gray-700 mb-2">5.3 Droits des utilisateurs</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Conformément aux lois applicables, l'utilisateur dispose d'un droit d'accès, de rectification, de portabilité et de suppression de ses données personnelles, ainsi que d'un droit d'opposition à leur traitement. Pour exercer ces droits, l'utilisateur peut adresser une demande par e-mail.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Limitation de Responsabilité</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Les informations diffusées sur la plateforme sont fournies à titre indicatif. L'éditeur ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des fonctionnalités ou de la présence de virus sur son site.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Modification des CGU</h2>
                    <p className="text-gray-600 leading-relaxed">
                        L'éditeur se réserve le droit de modifier unilatéralement et à tout moment le contenu des présentes CGU. L'utilisateur est invité à les consulter régulièrement pour se tenir informé des éventuels changements.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Droit Applicable et Juridiction Compétente</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Les présentes CGU sont régies par le droit en vigueur. En cas de litige né de l'interprétation ou de l'exécution des présentes, et à défaut d'accord amiable, les tribunaux compétents seront saisis pour régler le différend.
                    </p>
                </section>
            </div>
        </main>
    );
};