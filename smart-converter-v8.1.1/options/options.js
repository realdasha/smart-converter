const all=["USD","EUR","GBP","RUB","PLN","AED","QAR","SAR","KWD","BHD","OMR","HKD","SGD","JPY","CNY","INR","KRW","TWD","THB","MYR","IDR","PHP","VND","AUD","NZD","CAD","CHF","SEK","NOK","DKK","CZK","HUF","RON","BGN","TRY","UAH","KZT","ILS","ZAR","MXN","BRL","ARS","CLP","COP","PEN","EGP","MAD","NGN"];
const defaults={targetCurrencies:["EUR","RUB","USD"],enabledCategories:{currency:true,units:true},preferredSystem:"metric",unitPrefs:{length:"auto",mass:"kg",temperature:"C",volume:"L",area:"m2"}};
const box=document.getElementById('currencies');
box.innerHTML=all.map(c=>`<label class="card"><input name="cur" type="checkbox" value="${c}"> ${c}</label>`).join('');
function updateCustom(){document.getElementById('customUnits').classList.toggle('show',document.getElementById('preferredSystem').value==='custom');}
document.getElementById('preferredSystem').addEventListener('change',updateCustom);
chrome.storage.local.get().then(s=>{
  s={...defaults,...s,enabledCategories:{...defaults.enabledCategories,...(s.enabledCategories||{})},unitPrefs:{...defaults.unitPrefs,...(s.unitPrefs||{})}};
  document.querySelectorAll('[name=cur]').forEach(i=>i.checked=s.targetCurrencies.includes(i.value));
  document.getElementById('currency').checked=s.enabledCategories.currency!==false;
  document.getElementById('units').checked=s.enabledCategories.units!==false;
  document.getElementById('preferredSystem').value=s.preferredSystem||'metric';
  document.getElementById('unitLength').value=s.unitPrefs.length||'auto';
  document.getElementById('unitMass').value=s.unitPrefs.mass||'kg';
  document.getElementById('unitTemp').value=s.unitPrefs.temperature||'C';
  document.getElementById('unitVolume').value=s.unitPrefs.volume||'L';
  document.getElementById('unitArea').value=s.unitPrefs.area||'m2';
  updateCustom();
});
document.getElementById('save').onclick=async()=>{
  const targetCurrencies=[...document.querySelectorAll('[name=cur]:checked')].map(i=>i.value);
  await chrome.storage.local.set({
    targetCurrencies:targetCurrencies.length?targetCurrencies:["EUR"],
    preferredSystem:document.getElementById('preferredSystem').value,
    unitPrefs:{length:document.getElementById('unitLength').value,mass:document.getElementById('unitMass').value,temperature:document.getElementById('unitTemp').value,volume:document.getElementById('unitVolume').value,area:document.getElementById('unitArea').value},
    enabledCategories:{currency:document.getElementById('currency').checked,units:document.getElementById('units').checked}
  });
  document.getElementById('status').textContent='Saved. Refresh webpages before testing.';
};
