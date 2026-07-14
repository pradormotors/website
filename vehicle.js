const csvUrl =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vShNE87hHjBK353mmmUQQUCkoQ8CmPP56v5L-jjKrCtaBel3YtZKMVd0DU7KUsDhvXj6ckeapyKhrty/pub?output=csv';

/*
  These are the details that are not currently stored in the Google Sheet.
  Keep year, make, model, price, mileage, status, main photo, and title in the Sheet.
*/
const vehicleExtras = {
  '1001': {
    exteriorColor: 'Silver',
    interiorColor: 'Black',
    financingAvailable: true,
    photos: Array.from({ length: 10 }, (_, index) =>
      `photos/1001_${String(index + 1).padStart(3, '0')}.jpg`
    ),
    description: [
      'Prado R Motors presents this 2015 Hyundai Elantra SE 5-passenger sedan for sale for only $7,700. It has a clean title, very low mileage at approximately 71,486 miles, and is mechanically sound. It is a great gas-saving option for everyday commutes, school, work, and more. Come test drive it! The vehicle has some interior and exterior cosmetic imperfections, but nothing major.',
      'Included features include cold A/C, touchscreen display, Bluetooth, rearview camera, and more.',
      'Give us a call at (956) 278-5472 for more information. We are an official dealership; taxes and fees apply. We do not charge additional dealer fees. Visit us at 22325 Engelman Gardens Rd, Monte Alto, Texas. Please call to confirm availability, as vehicles may sell before the online inventory is updated.',
      'We understand our location is outside city limits. You may call to schedule a viewing and test drive, and we can arrange to bring the requested vehicle to a nearby public location.'
    ]
  },

  '1002': {
    exteriorColor: 'White',
    interiorColor: 'Black / Gray',
    financingAvailable: true,
    photos: Array.from({ length: 19 }, (_, index) =>
      `photos/1002_${String(index + 1).padStart(3, '0')}.jpg`
    ),
    description: [
      'Prado R Motors presents this clean 2015 Volkswagen Passat TSI SE 1.8T Sport 5-passenger sedan for sale for only $8,400. It has a clean title, approximately 92,840 miles, and is mechanically sound. It is great on gas and offers a very smooth drive. Come test drive it!',
      'Included features include cold A/C, touchscreen display, Bluetooth, rearview camera, two-tone interior, carbon-fiber-style trim, and more.',
      'Give us a call at (956) 278-5472 for more information. We are an official dealership; taxes and fees apply. We do not charge additional dealer fees. Visit us at 22325 Engelman Gardens Rd, Monte Alto, Texas. Please call to confirm availability, as vehicles may sell before the online inventory is updated.',
      'We understand our location is outside city limits. You may call to schedule a viewing and test drive, and we can arrange to bring the requested vehicle to a nearby public location.'
    ]
  },

  '1003': {
    exteriorColor: 'Blue',
    interiorColor: 'Black',
    financingAvailable: true,
    photos: Array.from({ length: 20 }, (_, index) =>
      `photos/1003_${String(index + 1).padStart(3, '0')}.jpg`
    ),
    description: [
      'Prado R Motors presents this clean 2020 Ford EcoSport SE for sale for $8,900. It has a clean title, approximately 107,429 miles, and is mechanically sound. It is a great gas-saving option for school, commuting, or everyday driving. Come test drive it!',
      'Included features include cold A/C, touchscreen display, Bluetooth, Apple CarPlay, rearview camera with proximity sensors, power driver\'s seat, intelligent access, and more.',
      'Give us a call at (956) 278-5472 for more information. We are an official dealership; taxes and fees apply. We do not charge additional dealer fees. Visit us at 22325 Engelman Gardens Rd, Monte Alto, Texas. Please call to confirm availability, as vehicles may sell before the online inventory is updated.',
      'We understand our location is outside city limits. You may call to schedule a viewing and test drive, and we can arrange to bring the requested vehicle to a nearby public location.'
    ]
  }
};

const params = new URLSearchParams(window.location.search);
const stockFromUrl = params.get('stock');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];
    const nextCharacter = line[i + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      current += '"';
      i += 1;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === ',' && !insideQuotes) {
      values.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

function getStatusClass(status) {
  const statusKey = status.toLowerCase();

  if (statusKey === 'sale pending' || statusKey === 'pending') {
    return 'pending';
  }

  if (statusKey === 'sold') {
    return 'sold';
  }

  return 'available';
}

function getTitleClass(titleStatus) {
  const titleKey = titleStatus.toLowerCase();

  if (titleKey.includes('salvage')) return 'title-salvage';
  if (titleKey.includes('rebuilt')) return 'title-rebuilt';
  return 'title-clean';
}

function renderGallery(photos, vehicleName) {
  const safePhotos = photos.length > 0 ? photos : ['images/placeholder.jpg'];

  return `
    <div class="gallery">
      <div class="photo-wrapper">
        <span class="status-badge" id="gallery-status"></span>

        <button class="gallery-arrow gallery-arrow-left" id="previous-photo" type="button" aria-label="Previous photo">‹</button>

        <img
          class="main-photo"
          id="main-photo"
          src="${safePhotos[0]}"
          alt="${vehicleName} photo 1"
        >

        <button class="gallery-arrow gallery-arrow-right" id="next-photo" type="button" aria-label="Next photo">›</button>

        <div class="photo-counter" id="photo-counter">1 / ${safePhotos.length}</div>
      </div>

      <div class="thumbnail-strip" id="thumbnail-strip">
        ${safePhotos.map((photo, index) => `
          <button
            class="thumbnail-button${index === 0 ? ' active' : ''}"
            type="button"
            data-photo-index="${index}"
            aria-label="View photo ${index + 1}"
          >
            <img src="${photo}" alt="${vehicleName} thumbnail ${index + 1}" loading="lazy">
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function initializeGallery(photos, vehicleName, status, statusClass) {
  let currentPhotoIndex = 0;
  const mainPhoto = document.getElementById('main-photo');
  const counter = document.getElementById('photo-counter');
  const thumbnailButtons = [...document.querySelectorAll('.thumbnail-button')];
  const statusBadge = document.getElementById('gallery-status');

  statusBadge.textContent = status;
  statusBadge.classList.add(statusClass);

  function showPhoto(index) {
    currentPhotoIndex = (index + photos.length) % photos.length;
    mainPhoto.src = photos[currentPhotoIndex];
    mainPhoto.alt = `${vehicleName} photo ${currentPhotoIndex + 1}`;
    counter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;

    thumbnailButtons.forEach((button, buttonIndex) => {
      button.classList.toggle('active', buttonIndex === currentPhotoIndex);
    });

    thumbnailButtons[currentPhotoIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  document.getElementById('previous-photo').addEventListener('click', () => {
    showPhoto(currentPhotoIndex - 1);
  });

  document.getElementById('next-photo').addEventListener('click', () => {
    showPhoto(currentPhotoIndex + 1);
  });

  thumbnailButtons.forEach(button => {
    button.addEventListener('click', () => {
      showPhoto(Number(button.dataset.photoIndex));
    });
  });

  mainPhoto.addEventListener('click', () => {
    if (mainPhoto.requestFullscreen) {
      mainPhoto.requestFullscreen();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
  });
}

fetch(csvUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Inventory request failed (${response.status})`);
    }

    return response.text();
  })
  .then(text => {
    const rows = text.trim().split(/\r?\n/);
    let selectedVehicle = null;

    rows.slice(1).forEach(row => {
      const columns = parseCsvLine(row);
      const stock = columns[0]?.trim();

      if (stock === stockFromUrl) {
        selectedVehicle = columns;
      }
    });

    const container = document.getElementById('vehicle-detail');

    if (!selectedVehicle) {
      container.innerHTML = `
        <div class="message-box">
          <h1>Vehicle Not Found</h1>
          <p>We could not find this vehicle in our current inventory.</p>
        </div>
      `;
      return;
    }

    const stock = selectedVehicle[0]?.trim() || '';
    const year = selectedVehicle[1]?.trim() || '';
    const make = selectedVehicle[2]?.trim() || '';
    const model = selectedVehicle[3]?.trim() || '';
    const price = Number(selectedVehicle[4] || 0).toLocaleString();
    const mileage = Number(selectedVehicle[5] || 0).toLocaleString();
    const status = selectedVehicle[6]?.trim() || 'For Sale';
    const sheetPhoto = selectedVehicle[7]?.trim() || '';
    const titleStatus = selectedVehicle[8]?.trim() || 'Contact Dealer';
    const trim = selectedVehicle[9]?.trim() || '';

    const extras = vehicleExtras[stock] || {
      trim: '',
      exteriorColor: 'Contact Dealer',
      interiorColor: 'Contact Dealer',
      financingAvailable: true,
      photos: sheetPhoto ? [sheetPhoto] : [],
      description: ['Contact Prado R Motors for more information about this vehicle.']
    };

    const photos = extras.photos?.length ? extras.photos : [sheetPhoto].filter(Boolean);
    const fullModelName = [year, make, model, trim].filter(Boolean).join(' ');
    const statusClass = getStatusClass(status);
    const titleClass = getTitleClass(titleStatus);

    document.title = `${fullModelName} | Prado R Motors`;

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <div class="stock-number">Stock #${stock}</div>
          <h1>${fullModelName}</h1>
          <div class="price">$${price}</div>
        </div>
      </div>

      <div class="detail-layout">
        ${renderGallery(photos, fullModelName)}

        <aside class="info-box">
          <h2>Vehicle Details</h2>

          <div class="spec-grid">
            <div class="spec-item">
              <div class="spec-label">Mileage</div>
              <div class="spec-value">${mileage} miles</div>
            </div>

            <div class="spec-item financing-item">
              <div class="spec-label">Financing</div>
              <div class="spec-value financing-value">
                ${extras.financingAvailable ? 'Financing Available' : 'Contact Dealer'}
              </div>
            </div>

            <div class="spec-item">
              <div class="spec-label">Title</div>
              <div class="spec-value ${titleClass}">${titleStatus}</div>
            </div>

            <div class="spec-item">
              <div class="spec-label">Exterior Color</div>
              <div class="spec-value">${extras.exteriorColor}</div>
            </div>

            <div class="spec-item">
              <div class="spec-label">Interior Color</div>
              <div class="spec-value">${extras.interiorColor}</div>
            </div>

            <div class="spec-item">
              <div class="spec-label">Availability</div>
              <div class="spec-value">${status}</div>
            </div>
          </div>

          <div class="contact-actions">
            <a class="contact-button primary" href="tel:+19562785472">Call (956) 278-5472</a>
            <a class="contact-button secondary" href="https://wa.me/19562785472?text=${encodeURIComponent(`Hi, I am interested in the ${fullModelName}, stock number ${stock}.`)}" target="_blank" rel="noopener">Message on WhatsApp</a>
          </div>
        </aside>
      </div>

      <section class="description-box">
        <h2>Vehicle Description</h2>
        ${extras.description.map(paragraph => `<p>${paragraph}</p>`).join('')}
      </section>

      <section class="location-box">
        <h2>Schedule a Test Drive</h2>
        <p>Call Prado R Motors to confirm availability and arrange a viewing at 22325 Engelman Gardens Rd, Monte Alto, Texas.</p>
      </section>
    `;

    initializeGallery(photos, fullModelName, status, statusClass);
  })
  .catch(error => {
    document.getElementById('vehicle-detail').innerHTML = `
      <div class="message-box">
        <h1>Error Loading Vehicle</h1>
        <p>${error.message}</p>
      </div>
    `;
  });
