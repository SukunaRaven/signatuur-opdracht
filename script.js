document.addEventListener('DOMContentLoaded', () => {
  const boekenData = [
    { id:'boek1', titel:'Be aware of the Watching Eye - TLE 1', disabled:false },
    { id:'boek2', titel:'Be aware of the Surroundings - TLE 2', disabled:false },
    { id:'boek4', titel:'To be released: April 2026 - TLE 3', disabled:true },
    { id:'boek5', titel:'To be released: June 2026 - TLE 4', disabled:true },
    { id:'boek3', titel:'Be aware of the Assessed - Assesment 1 Novel', disabled:false },
    { id:'boek6', titel:'To be released: June 2026 - Assesment 2 Novel', disabled:true }
  ];

  const boekenkast = document.getElementById('boekenkast');

  boekenData.forEach(b => {
    const col = document.createElement('div');
    col.className = 'column is-one-quarter';

    const card = document.createElement('div');
    card.className = `card boek${b.disabled?' disabled':''}`;
    if(!b.disabled) card.dataset.id = b.id;

    card.innerHTML = `
      <div class="card-image">
        <figure class="image is-4by5">
          <img src="fotos/${b.id}-cover.jpg" alt="${b.titel}">
        </figure>
      </div>
      <div class="card-content">
        <p class="title is-5">${b.titel}</p>
      </div>
    `;

    col.appendChild(card);
    boekenkast.appendChild(col);
  });

  const modal = document.getElementById('boek-modal');
  const modalContent = document.getElementById('boek-content');
  let currentBoekId = '';
  let currentHoofdstuk = 0;

  const navHtml = `
    <div id="nav-buttons" style="margin-top:1rem; display:flex; justify-content:space-between;">
      <button id="prev-hoofdstuk" class="button is-info">Vorige</button>
      <button id="next-hoofdstuk" class="button is-info">Volgende</button>
    </div>
  `;

  function hoofdstukBestaat(boekId, hoofdstukIndex) {
    return fetch(`${boekId}/h${hoofdstukIndex}.html`, { method: 'HEAD' })
      .then(res => res.ok)
      .catch(() => false);
  }

  function loadHoofdstuk(boekId, hoofdstukIndex){
    fetch(`${boekId}/h${hoofdstukIndex}.html`)
      .then(res => {
        if (!res.ok) throw new Error('Hoofdstuk bestaat niet');
        return res.text();
      })
      .then(data => {
        modalContent.innerHTML = data + navHtml;
      })
      .catch(() => {
        modalContent.innerHTML = `
          <div class="chapter">
            <h2>Hoofdstuk niet beschikbaar</h2>
            <p>Dit hoofdstuk is nog in ontwikkeling.</p>
          </div>
          ${navHtml}
        `;
      });
  }

  document.querySelectorAll('.card.boek:not(.disabled)').forEach(card => {
    card.addEventListener('click', ()=>{
      currentBoekId = card.dataset.id;
      currentHoofdstuk = 0;
      modal.classList.add('active');
      loadHoofdstuk(currentBoekId, currentHoofdstuk);
    });
  });

  document.querySelector('.boek-modal-close').addEventListener('click', ()=>{
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('click', async e => {
    if (e.target.id === 'next-hoofdstuk') {
      const volgende = currentHoofdstuk + 1;
      if (await hoofdstukBestaat(currentBoekId, volgende)) {
        currentHoofdstuk = volgende;
        loadHoofdstuk(currentBoekId, currentHoofdstuk);
      }
    }

    if (e.target.id === 'prev-hoofdstuk') {
      const vorige = currentHoofdstuk - 1;
      if (vorige >= 0 && await hoofdstukBestaat(currentBoekId, vorige)) {
        currentHoofdstuk = vorige;
        loadHoofdstuk(currentBoekId, currentHoofdstuk);
      }
    }
  });

});
