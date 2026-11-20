const $ = s => document.querySelector(s);
const CATS = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'];
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }); // change currency here
let items = load();

function load() { try { return JSON.parse(localStorage.getItem('expenses')) || []; } catch { return []; } }
function save() { try { localStorage.setItem('expenses', JSON.stringify(items)); } catch {} }

$('#cat').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
$('#filter').innerHTML = '<option value="">All categories</option>' + CATS.map(c => `<option>${c}</option>`).join('');
$('#date').value = new Date().toISOString().slice(0, 10);

function render() {
  const f = $('#filter').value;
  const shown = items.filter(x => !f || x.cat === f).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  $('#total').textContent = money.format(shown.reduce((s, x) => s + x.amount, 0));

  const totals = CATS.map(c => [c, items.filter(x => x.cat === c).reduce((s, x) => s + x.amount, 0)]).filter(t => t[1] > 0);
  const max = Math.max(...totals.map(t => t[1]), 1);
  $('#bars').innerHTML = totals.map(([c, v]) =>
    `<div class="bar">${c} · ${money.format(v)}<div style="width:${v / max * 100}%"></div></div>`).join('');

  const list = $('#list');
  list.innerHTML = '';
  shown.forEach(x => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = x.desc;
    const small = document.createElement('small');
    small.textContent = `${x.cat} · ${x.date}`;
    info.append(small);
    const amt = document.createElement('strong');
    amt.textContent = money.format(x.amount);
    const del = document.createElement('button');
    del.className = 'del'; del.textContent = 'Delete'; del.dataset.id = x.id;
    li.append(info, amt, del);
    list.append(li);
  });
  $('#empty').hidden = shown.length > 0;
}

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const amount = parseFloat($('#amount').value);
  const desc = $('#desc').value.trim();
  if (!desc || !(amount > 0)) return;
  items.push({ id: Date.now(), desc, amount, cat: $('#cat').value, date: $('#date').value });
  save(); render();
  $('#desc').value = ''; $('#amount').value = ''; $('#desc').focus();
});
$('#list').addEventListener('click', e => {
  if (!e.target.dataset.id) return;
  items = items.filter(x => x.id != e.target.dataset.id);
  save(); render();
});
$('#filter').addEventListener('change', render);
render();
