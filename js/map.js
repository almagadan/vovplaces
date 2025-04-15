// map.js
class MemorialMap {
    constructor() {
      this.map = null;
      this.markers = [];
      this.loader = document.querySelector('.map-loader');
      this.config = {
        center: [53.1364, 29.2214],
        zoom: 13,
        minZoom: 10,
        maxZoom: 18,
        tileLayers: [
          {
            name: 'Спутник',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri'
          }, 
          {
            name: 'Тёмная тема',
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© OpenStreetMap, © CARTO'
          } 
        ],
        icon: {
          iconUrl: 'img/markers/memorial-marker.svg',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -35]
          
        }
      };
  
      this.initialize();
    }
  
    initialize() {
      this.initMap();
      this.showLoader();
      this.loadData()
        .catch(error => {
          console.error('Ошибка инициализации:', error);
          this.showError();
        })
        .finally(() => this.hideLoader());
    }
  
    initMap() {
      this.map = L.map('map', {
        center: this.config.center,
        zoom: this.config.zoom,
        minZoom: this.config.minZoom,
        maxZoom: this.config.maxZoom,
        preferCanvas: true
      });
  
      this.initBaseLayers();
      this.initControls();
    }
  
    initBaseLayers() {
      if (!this.config.tileLayers || !Array.isArray(this.config.tileLayers)) {
        console.error('Некорректная конфигурация слоёв');
        return;
      }
  
      const baseLayers = {};
      this.config.tileLayers.forEach(layer => {
        if (layer.url && layer.name) {
          baseLayers[layer.name] = L.tileLayer(layer.url, {
            attribution: layer.attribution
          });
        }
      });
  
      if (Object.keys(baseLayers).length > 0) {
        const firstLayerKey = Object.keys(baseLayers)[0];
        baseLayers[firstLayerKey].addTo(this.map);
        L.control.layers(baseLayers).addTo(this.map);
      }
    }
  
    initControls() {
      L.control.zoom({
        position: 'bottomright'
      }).addTo(this.map);
  
      L.control.scale({
        position: 'bottomleft',
        imperial: false
      }).addTo(this.map);
    }
  
    async loadData() {
      try {
        const response = await fetch('places/data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        
        this.createMarkers(data);
        this.fitMapBounds();
  
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.showError();
        throw error;
      }
    }
  
    createMarkers(places) {
      if (!places || !Array.isArray(places)) {
        console.error('Некорректные данные мест');
        return;
      }
  
      const customIcon = L.icon(this.config.icon);
      
      this.markers = places.map(place => {
        const marker = L.marker([place.lat, place.lng], { 
          icon: customIcon,
          title: place.name
        });
  
        marker
          .addTo(this.map)
          .bindPopup(this.createPopupContent(place))
          .on('click', () => this.handleMarkerClick(place.id));
  
        return marker;
      });
    }
  
    createPopupContent(place) {
      return `
        <div class="popup-content">
          <h3 class="popup-title">${place.name}</h3>
          ${place.photo ? `
            <img src="img/${place.photo}" 
                 alt="${place.name}" 
                 class="popup-image"
                 loading="lazy">` : ''}
          <a href="place.html?id=${place.id}" 
             class="popup-link">
             Подробнее →
          </a>
        </div>
      `;
    }
  
    handleMarkerClick(id) {
      window.location.href = `place.html?id=${id}`;
    }
  
    fitMapBounds() {
      if (this.markers.length === 0) return;
  
      const bounds = L.latLngBounds(
        this.markers.map(marker => marker.getLatLng())
      );
      
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  
    showLoader() {
      if (this.loader) this.loader.style.display = 'block';
    }
  
    hideLoader() {
      if (this.loader) this.loader.style.display = 'none';
    }
  
    showError() {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'map-error';
      errorDiv.innerHTML = `
        <div class="error-content">
          <p>⚠️ Ошибка загрузки данных</p>
          <button onclick="location.reload()">Обновить страницу</button>
        </div>
      `;
      document.getElementById('map').appendChild(errorDiv);
    }
  }
  
  // Инициализация после полной загрузки страницы
  document.addEventListener('DOMContentLoaded', () => {
    new MemorialMap();
  });

  // Добавить в конец map.js или отдельный файл
class ArchiveSlider {
    constructor() {
      this.slider = document.querySelector('.slider-container');
      this.slides = document.querySelectorAll('.slide');
      this.navDots = document.querySelector('.slider-nav');
      this.currentSlide = 0;
      this.interval = null;
  
      this.initNavigation();
      this.startAutoPlay();
      this.addEventListeners();
    }
  
    initNavigation() {
      this.slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.addEventListener('click', () => this.goToSlide(index));
        this.navDots.appendChild(dot);
      });
      this.updateNavigation();
    }
  
    goToSlide(index) {
      this.currentSlide = (index + this.slides.length) % this.slides.length;
      this.slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      this.updateNavigation();
    }
  
    updateNavigation() {
      document.querySelectorAll('.slider-nav span').forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
    }
  
    startAutoPlay() {
      this.interval = setInterval(() => {
        this.goToSlide(this.currentSlide + 1);
      }, 5000);
    }
  
    addEventListeners() {
      this.slider.parentElement.addEventListener('mouseenter', () => {
        clearInterval(this.interval);
      });
      
      this.slider.parentElement.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });
    }
  }
  
  // Инициализация после загрузки DOM
  document.addEventListener('DOMContentLoaded', () => {
    new ArchiveSlider();
  });