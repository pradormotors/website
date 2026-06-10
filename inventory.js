alert("COMING SOON: THIS IS A SAMPLE PAGE");

const csvUrl =
'https://docs.google.com/spreadsheets/d/e/2PACX-1vShNE87hHjBK353mmmUQQUCkoQ8CmPP56v5L-jjKrCtaBel3YtZKMVd0DU7KUsDhvXj6ckeapyKhrty/pub?output=csv';

fetch(csvUrl)
  .then(r => r.text())
  .then(text => {

    const rows = text.split('\n');

    let html = '';

    rows.slice(1).forEach(row => {

      const cols = row.split(',');
      console.log(cols);

      const photo = cols[7].trim();
      const status = cols[6].trim().toLowerCase();

let badgeClass = "available";

if (status === "pending") {
  badgeClass = "pending";
}

if (status === "sold") {
  badgeClass = "sold";
}
      
      html += `
<div class="vehicle-card">

  <div class="vehicle-image-wrapper">
    <img
      class="vehicle-photo"
      src="${photo}"
      alt="${cols[1]} ${cols[2]} ${cols[3]}"
    >

    <span class="badge ${badgeClass}">
      ${cols[6]}
    </span>
  </div>

  <div class="vehicle-info">

    <h3 class="vehicle-title">
      ${cols[1]} ${cols[2]} ${cols[3]}
    </h3>

    <div class="vehicle-price">
      $${Number(cols[4]).toLocaleString()}
    </div>

    <p class="vehicle-miles">
      ${Number(cols[5]).toLocaleString()} miles
    </p>

  </div>

</div>
`;
    });

    document.getElementById('inventory').innerHTML = html;
  });
