const csvUrl =
'https://docs.google.com/spreadsheets/d/e/2PACX-1vShNE87hHjBK353mmmUQQUCkoQ8CmPP56v5L-jjKrCtaBel3YtZKMVd0DU7KUsDhvXj6ckeapyKhrty/pub?output=csv';

fetch(csvUrl)
  .then(r => r.text())
  .then(text => {

    const rows = text.split('\n');

    let html = '';

    rows.slice(1).forEach(row => {

      const cols = row.split(',');

      html += `
  <div>
    <img
  class="vehicle-photo"
  src="${cols[7]}"
  alt="${cols[1]} ${cols[2]} ${cols[3]}"
  >

    <h3>${cols[1]} ${cols[2]} ${cols[3]}</h3>

    <p>Price: $${cols[4]}</p>

    <p>Miles: ${cols[5]}</p>
  </div>
`;
    });

    document.getElementById('inventory').innerHTML = html;
  });
