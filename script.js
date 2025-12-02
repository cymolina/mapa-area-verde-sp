// Inicializa o mapa
const map = L.map('map').setView([-23.55, -46.63], 12);

// Base escura
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
}).addTo(map);

// Variáveis globais
let parques = null;
let limitesSubprefeitura = null;

const areaElement = document.getElementById('area-calculada');

// -------------------------------------------------------
// CARREGAR LIMITES
// -------------------------------------------------------
fetch('./limitesubprefeitura_4326.geojson')
    .then(res => res.json())
    .then(data => {
        limitesSubprefeitura = L.geoJSON(data, {
            style: {
                color: '#8c8c8c',
                weight: 1,
                fillOpacity: 0.05
            }
        }).addTo(map);
    });

// -------------------------------------------------------
// CARREGAR PARQUES EM VERDE NEON
// -------------------------------------------------------
fetch('./parques_4326.geojson')
    .then(res => res.json())
    .then(data => {
        parques = L.geoJSON(data, {
            style: {
                color: '#39ff14',
                fillColor: '#39ff14',
                weight: 1,
                fillOpacity: 0.85
            }
        }).addTo(map);
    });

// -------------------------------------------------------
// LUPA (CÍRCULO DINÂMICO)
// -------------------------------------------------------
let raio = 1000; // metros

let circle = L.circle([0, 0], {
    radius: raio,
    color: '#ffffff',
    weight: 2,
    fillColor: '#39ff14',
    fillOpacity: 0.15
}).addTo(map);

// -------------------------------------------------------
// EVENTO DE MOUSEMOVE — CALCULA A ÁREA
// -------------------------------------------------------
map.on("mousemove", function (e) {

    // move a lupa com o mouse
    circle.setLatLng(e.latlng);

    // Se ainda não carregou os parques
    if (!parques) {
        areaElement.innerHTML = "0 m²";
        return;
    }

    // Turf usa km
    const raioKm = raio / 1000;

    // Cria círculo turf
    const turfCircle = turf.circle(
        [e.latlng.lng, e.latlng.lat],
        raioKm,
        { units: "kilometers" }
    );

    const parquesGeo = parques.toGeoJSON();
    let area = 0;

    parquesGeo.features.forEach(feature => {
        const inter = turf.intersect(feature, turfCircle);
        if (inter) {
            area += turf.area(inter); // em m²
        }
    });

    // Atualiza painel
    areaElement.innerHTML =
        `${area.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m<sup>2</sup>`;
});
