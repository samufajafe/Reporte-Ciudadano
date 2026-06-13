import { useEffect, useRef } from 'react';

const L = window.L;

const minLat = 9.90;
const maxLat = 9.97;
const minLng = -84.15;
const maxLng = -84.02;

export const percentToLatLng = (x, y) => {
  const lng = minLng + (x / 100) * (maxLng - minLng);
  const lat = maxLat - (y / 100) * (maxLat - minLat);
  return { lat, lng };
};

const PROVINCE_CENTERS = {
  'San José': [9.9333, -84.0833],
  'Alajuela': [10.0167, -84.2167],
  'Cartago': [9.8667, -83.9167],
  'Heredia': [9.998, -84.118],
  'Guanacaste': [10.62, -85.44],
  'Puntarenas': [9.976, -84.83],
  'Limón': [9.99, -83.04]
};

export function MapSelector({ onSelectCoordinates, initialCoordinates, provinceName }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const customMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const latLngToPercent = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(0, Math.min(100, Math.round(x))),
      y: Math.max(0, Math.min(100, Math.round(y)))
    };
  };

  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      const defaultCenter = initialCoordinates && (initialCoordinates.lat || initialCoordinates.x)
        ? [
            initialCoordinates.lat || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lat,
            initialCoordinates.lng || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lng
          ]
        : (provinceName && PROVINCE_CENTERS[provinceName] ? PROVINCE_CENTERS[provinceName] : [9.9333, -84.0833]);

      const defaultZoom = initialCoordinates ? 15 : 12;

      const map = L.map(containerRef.current).setView(defaultCenter, defaultZoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      if (initialCoordinates) {
        const initLat = initialCoordinates.lat || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lat;
        const initLng = initialCoordinates.lng || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lng;
        markerRef.current = L.marker([initLat, initLng], { icon: customMarkerIcon }).addTo(map);
      }

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const { x, y } = latLngToPercent(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng, { icon: customMarkerIcon }).addTo(map);
        }

        onSelectCoordinates({ lat, lng, x, y });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!initialCoordinates) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    } else {
      const lat = initialCoordinates.lat || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lat;
      const lng = initialCoordinates.lng || percentToLatLng(initialCoordinates.x, initialCoordinates.y).lng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(mapRef.current);
      }
    }
  }, [initialCoordinates]);

  useEffect(() => {
    if (provinceName && PROVINCE_CENTERS[provinceName] && mapRef.current) {
      if (!markerRef.current) {
        const center = PROVINCE_CENTERS[provinceName];
        mapRef.current.flyTo(center, 12);
      }
    }
  }, [provinceName]);

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const { x, y } = latLngToPercent(lat, lng);

          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 15);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(mapRef.current);
            }
          }
          onSelectCoordinates({ lat, lng, x, y });
        },
        (error) => {
          console.warn('GPS failed:', error);
          alert('No se pudo acceder al GPS real. Marca tu ubicación manualmente haciendo clic en el mapa.');
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
      <div
        ref={containerRef}
        style={{
          height: '350px',
          width: '100%',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          zIndex: 1
        }}
      />
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={handleGPS}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'var(--bg-card, #fff)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        🛰️ Usar GPS Real
      </button>
    </div>
  );
}

export function MapPreview({ coordinates }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const customMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (!coordinates) return;

    const lat = coordinates.lat || percentToLatLng(coordinates.x, coordinates.y).lat;
    const lng = coordinates.lng || percentToLatLng(coordinates.x, coordinates.y).lng;

    if (!mapRef.current && containerRef.current) {
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        dragging: true
      }).setView([lat, lng], 15);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      markerRef.current = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(map);
    } else if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(mapRef.current);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [coordinates]);

  if (!coordinates) {
    return (
      <div style={{
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-muted)'
      }}>
        Sin ubicación registrada
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '250px',
        width: '100%',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        zIndex: 1,
        marginBottom: '15px'
      }}
    />
  );
}

export function AuthorityMap({ reports, onSelectReport, showMarkers = true, showHeat = true, heatRadius = 25, heatBlur = 15 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      const map = L.map(containerRef.current).setView([9.9333, -84.0833], 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
        heatLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const heatPoints = [];

    reports.forEach((r) => {
      if (!r.coordinates) return;

      const lat = r.coordinates.lat || percentToLatLng(r.coordinates.x, r.coordinates.y).lat;
      const lng = r.coordinates.lng || percentToLatLng(r.coordinates.x, r.coordinates.y).lng;

      heatPoints.push([lat, lng, 1.0]);

      if (showMarkers) {
        let color = '#6b7280'; 
        if (r.status === 'assigned') color = '#3b82f6';
        else if (r.status === 'in_progress') color = '#8b5cf6';
        else if (r.status === 'resolved') color = '#10b981';
        else if (r.status === 'closed') color = '#1f2937';
        else if (r.status === 'rejected') color = '#ef4444';

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9
        });

        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'sans-serif';
        popupContent.style.fontSize = '12px';
        popupContent.style.width = '200px';
        
        const titleEl = document.createElement('strong');
        titleEl.style.display = 'block';
        titleEl.style.fontSize = '13px';
        titleEl.style.marginBottom = '4px';
        titleEl.innerText = r.title;
        popupContent.appendChild(titleEl);

        const locEl = document.createElement('span');
        locEl.style.color = '#6b7280';
        locEl.style.display = 'block';
        locEl.style.marginBottom = '8px';
        locEl.innerText = `📍 ${r.location}`;
        popupContent.appendChild(locEl);

        const statusEl = document.createElement('span');
        statusEl.style.display = 'inline-block';
        statusEl.style.fontSize = '10px';
        statusEl.style.background = `${color}20`;
        statusEl.style.color = color;
        statusEl.style.padding = '2px 6px';
        statusEl.style.borderRadius = '4px';
        statusEl.style.fontWeight = 'bold';
        statusEl.style.textTransform = 'uppercase';
        statusEl.innerText = r.status === 'received' ? 'recibido' : r.status === 'assigned' || r.status === 'in_progress' ? 'en gestión' : r.status === 'resolved' ? 'resuelto' : r.status === 'closed' ? 'cerrado' : 'rechazado';
        popupContent.appendChild(statusEl);

        const btn = document.createElement('button');
        btn.style.display = 'block';
        btn.style.marginTop = '10px';
        btn.style.width = '100%';
        btn.style.padding = '6px';
        btn.style.background = 'var(--primary, #3b82f6)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.innerText = 'Gestionar Caso';
        btn.addEventListener('click', () => {
          onSelectReport(r);
          marker.closePopup();
        });
        popupContent.appendChild(btn);

        marker.bindPopup(popupContent);
        markersLayerRef.current.addLayer(marker);
      }
    });

    if (showHeat && window.L.heatLayer && heatPoints.length > 0) {
      heatLayerRef.current = window.L.heatLayer(heatPoints, {
        radius: heatRadius,
        blur: heatBlur,
        maxZoom: 17
      }).addTo(mapRef.current);
    }
  }, [reports, showMarkers, showHeat, heatRadius, heatBlur]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '400px',
        width: '100%',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        zIndex: 1,
        marginBottom: '15px'
      }}
    />
  );
}
