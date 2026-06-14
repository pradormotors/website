const csvUrl =
'https://docs.google.com/spreadsheets/d/e/2PACX-1vShNE87hHjBK353mmmUQQUCkoQ8CmPP56v5L-jjKrCtaBel3YtZKMVd0DU7KUsDhvXj6ckeapyKhrty/pub?output=csv';

const params = new URLSearchParams(window.location.search);
const stockFromUrl = params.get('stock');

fetch(csvUrl)
  .then(r => r.text())
  .then(text => {
    const rows = text.trim().split('\n');

    let selectedVehicle = null;

    rows.slice(1).forEach(row => {
      const cols = row.split(',');

      const stock = cols[0].trim();

      if (stock === stockFromUrl) {
        selectedVehicle = cols;
      }
    });

    const container = document.getElementById('vehicle-detail');

    if (!selectedVehicle) {
      container.innerHTML = `
        <h1>Vehicle Not Found</h1>
        <p>We could not find this vehicle in our inventory.</p>
      `;
      return;
    }

    const stock = selectedVehicle[0].trim();
    const year = selectedVehicle[1].trim();
    const make = selectedVehicle[2].trim();
    const model = selectedVehicle[3].trim();
    const price = Number(selectedVehicle[4]).toLocaleString();
    const mileage = Number(selectedVehicle[5]).toLocaleString();
    const status = selectedVehicle[6].trim();
const photo = selectedVehicle[7].trim();

let badgeClass = "available";

const statusKey = status.toLowerCase();

if (statusKey === "sale pending") {
  badgeClass = "pending";
}

if (statusKey === "sold") {
  badgeClass = "sold";
}

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <h1>${year} ${make} ${model}</h1>
          <div class="price">$${price}</div>
        </div>

       <div class="status-container">
  <span class="status-badge ${badgeClass}">
    ${status}
  </span>
</div>

      <div class="detail-layout">

        <div>
          <img class="main-photo" src="${photo}" alt="${year} ${make} ${model}">
        </div>

        <div>
          <div class="info-box">

            <div class="spec-grid">
            
              <div class="spec-item">
                <div class="spec-label">Mileage</div>
                <div class="spec-value">${mileage} miles</div>
              </div>

              <div class="spec-item">
                <div class="spec-label">Financing</div>
                <div class="spec-value">Available</div>
              </div>

              <div class="spec-item">
                <div class="spec-label">Status</div>
                <div class="spec-value">${status}</div>
              </div>
            </div>

            <a class="contact-button" href="tel:+19562785472">
              Call Prado R Motors
            </a>

          </div>
        </div>

      </div>

      <div class="description-box">
        <h2>Vehicle Description</h2>
        <p>Contact Prado R Motors for more details about this vehicle.</p>
      </div>
    `;
  })
  .catch(error => {
    document.getElementById('vehicle-detail').innerHTML = `
      <h1>Error Loading Vehicle</h1>
      <p>${error}</p>
    `;
  });
