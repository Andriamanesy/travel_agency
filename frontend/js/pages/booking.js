import { apiRequest } from '../api.js';

const params = new URLSearchParams(location.search);
const circuitId = params.get('circuit_id');
const destinationId = params.get('destination_id');
const target = circuitId ? { type: 'circuits', id: circuitId, key: 'circuit_id' } : destinationId ? { type: 'destinations', id: destinationId, key: 'destination_id' } : null;
const errorBox = document.getElementById('booking-error');
let offer;

if (!target) fail('Choisissez d’abord un circuit ou une destination à réserver.');
else load();

async function load() {
  try {
    const response = await apiRequest(`/${target.type}/${encodeURIComponent(target.id)}`);
    offer = response[target.type.slice(0, -1)];
    if (!offer) throw new Error('Offre introuvable.');
    document.getElementById('offer-title').textContent = offer.title;
    document.getElementById('offer-location').textContent = offer.location || offer.destination?.location || '';
    document.getElementById('unit-price').textContent = format(offer.price);
    document.getElementById('booking-loading').classList.add('hidden');
    document.getElementById('booking-content').classList.remove('hidden');
    updateTotal();
  } catch (error) { fail(error.message); }
}

function format(value) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value || 0)); }
function updateTotal() { document.getElementById('total-price').textContent = format(Number(offer?.price || 0) * Number(document.getElementById('participants').value || 1)); }
document.getElementById('participants').addEventListener('input', updateTotal);
document.getElementById('booking-form').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = document.getElementById('booking-submit'); submit.disabled = true; submit.textContent = 'Envoi en cours…';
  try {
    await apiRequest('/bookings', 'POST', { [target.key]: target.id, start_date: document.getElementById('start-date').value, end_date: document.getElementById('end-date').value, participants_count: Number(document.getElementById('participants').value) });
    document.getElementById('booking-content').classList.add('hidden'); document.getElementById('booking-success').classList.remove('hidden');
  } catch (error) { fail(error.message); submit.disabled = false; submit.textContent = 'Envoyer ma demande de réservation'; }
});
function fail(message) { document.getElementById('booking-loading').classList.add('hidden'); errorBox.textContent = message; errorBox.classList.remove('hidden'); }
