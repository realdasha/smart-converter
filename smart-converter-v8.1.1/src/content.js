const CURRENCY_ALIASES={USD:["$","US$","USD","dollar","dollars"],EUR:["€","EUR","euro","euros"],GBP:["£","GBP","pound","pounds","sterling"],RUB:["₽","RUB","rub","ruble","rubles","rouble","roubles","руб","рубль","рубля","рублей"],PLN:["PLN","zł","zl","zloty","zlotys","zlotych"],AED:["AED","dirham","dirhams"],QAR:["QAR","qatari riyal","qatar riyal"],SAR:["SAR","saudi riyal"],KWD:["KWD","kuwaiti dinar"],BHD:["BHD","bahraini dinar"],OMR:["OMR","omani rial"],HKD:["HKD","HK$","hong kong dollar"],SGD:["SGD","S$","singapore dollar"],JPY:["¥","JPY","yen"],CNY:["CNY","RMB","yuan"],CNH:["CNH"],INR:["₹","INR","rupee","rupees"],KRW:["₩","KRW","won"],TWD:["TWD","NT$"],THB:["฿","THB","baht"],MYR:["MYR","ringgit"],IDR:["IDR","rupiah"],PHP:["PHP","philippine peso"],VND:["₫","VND","dong"],AUD:["AUD","A$"],NZD:["NZD","NZ$"],CAD:["CAD","C$"],CHF:["CHF","swiss franc"],SEK:["SEK"],NOK:["NOK"],DKK:["DKK"],CZK:["CZK"],HUF:["HUF"],RON:["RON"],BGN:["BGN"],TRY:["₺","TRY"],UAH:["₴","UAH"],KZT:["₸","KZT"],ILS:["₪","ILS"],ZAR:["ZAR"],MXN:["MXN"],BRL:["BRL","R$"],ARS:["ARS"],CLP:["CLP"],COP:["COP"],PEN:["PEN"],EGP:["EGP"],MAD:["MAD"],NGN:["NGN"]};
const ALIASES=[];for(const [code,arr] of Object.entries(CURRENCY_ALIASES)){for(const a of arr)ALIASES.push({code,alias:a});}ALIASES.sort((a,b)=>b.alias.length-a.alias.length);
const NUM="[-+]?\\d+(?:[ \\u00A0'.,]\\d{3})*(?:[.,]\\d+)?|[-+]?\\d+(?:[.,]\\d+)?";
const aliasRe=ALIASES.map(x=>esc(x.alias)).join("|");
const curPatterns=[new RegExp(`^\\s*(?<cur>${aliasRe})\\s*(?<num>${NUM})\\s*$`,"iu"),new RegExp(`^\\s*(?<num>${NUM})\\s*(?<cur>${aliasRe})\\s*$`,"iu")];
const UNIT_ALIASES=[
 {dim:"length",system:"imperial",unit:"ft",aliases:["ft","feet","foot"],toBase:v=>v*0.3048},
 {dim:"length",system:"imperial",unit:"in",aliases:["in","inch","inches"],toBase:v=>v*0.0254},
 {dim:"length",system:"imperial",unit:"mi",aliases:["mi","mile","miles"],toBase:v=>v*1609.344},
 {dim:"length",system:"metric",unit:"km",aliases:["km","kilometer","kilometers"],toBase:v=>v*1000},
 {dim:"length",system:"metric",unit:"cm",aliases:["cm","centimeter","centimeters"],toBase:v=>v/100},
 {dim:"length",system:"metric",unit:"m",aliases:["m","meter","meters","metre","metres"],toBase:v=>v},
 {dim:"mass",system:"imperial",unit:"lb",aliases:["lb","lbs","pound","pounds"],toBase:v=>v*0.45359237},
 {dim:"mass",system:"imperial",unit:"oz",aliases:["oz","ounce","ounces"],toBase:v=>v*0.0283495},
 {dim:"mass",system:"metric",unit:"kg",aliases:["kg","kilogram","kilograms"],toBase:v=>v},
 {dim:"mass",system:"metric",unit:"g",aliases:["g","gram","grams"],toBase:v=>v/1000},
 {dim:"volume",system:"imperial",unit:"gal",aliases:["gal","gallon","gallons"],toBase:v=>v*3.78541},
 {dim:"volume",system:"imperial",unit:"qt",aliases:["qt","quart","quarts"],toBase:v=>v*0.946353},
 {dim:"volume",system:"imperial",unit:"floz",aliases:["fl oz","floz","fluid ounce","fluid ounces"],toBase:v=>v*0.0295735},
 {dim:"volume",system:"metric",unit:"L",aliases:["l","liter","liters","litre","litres"],toBase:v=>v},
 {dim:"volume",system:"metric",unit:"ml",aliases:["ml","milliliter","milliliters","millilitre","millilitres"],toBase:v=>v/1000},
 {dim:"area",system:"imperial",unit:"sqft",aliases:["sq ft","sqft","ft²","ft2"],toBase:v=>v*0.092903},
 {dim:"area",system:"imperial",unit:"acre",aliases:["acre","acres"],toBase:v=>v*4046.86},
 {dim:"area",system:"metric",unit:"m2",aliases:["m²","m2","sqm","sq m"],toBase:v=>v},
 {dim:"temperature",system:"imperial",unit:"F",aliases:["°f","f","fahrenheit"],toBase:v=>(v-32)*5/9},
 {dim:"temperature",system:"metric",unit:"C",aliases:["°c","c","celsius"],toBase:v=>v}
];
function fromBase(dim,unit,v){
 if(dim==="length"){if(unit==="cm")return [v*100,"cm"]; if(unit==="m")return [v,"m"]; if(unit==="km")return [v/1000,"km"]; if(unit==="in")return [v/0.0254,"in"]; if(unit==="ft")return [v/0.3048,"ft"]; if(unit==="mi")return [v/1609.344,"mi"];}
 if(dim==="mass"){if(unit==="kg")return [v,"kg"]; if(unit==="g")return [v*1000,"g"]; if(unit==="lb")return [v/0.45359237,"lb"]; if(unit==="oz")return [v/0.0283495,"oz"];}
 if(dim==="volume"){if(unit==="L")return [v,"L"]; if(unit==="ml")return [v*1000,"ml"]; if(unit==="gal")return [v/3.78541,"gal"]; if(unit==="qt")return [v/0.946353,"qt"]; if(unit==="floz")return [v/0.0295735,"fl oz"];}
 if(dim==="area"){if(unit==="m2")return [v,"m²"]; if(unit==="sqft")return [v/0.092903,"sq ft"]; if(unit==="acre")return [v/4046.86,"acres"];}
 if(dim==="temperature"){if(unit==="C")return [v,"°C"]; if(unit==="F")return [v*9/5+32,"°F"];}
 return [v,unit];
}
function chooseUnit(parsed){
 const sys=prefs.preferredSystem||"metric";
 const up=prefs.unitPrefs||{};
 if(sys==="custom"){
  const custom={length:up.length||"auto",mass:up.mass||"kg",temperature:up.temperature||"C",volume:up.volume||"L",area:up.area||"m2"}[parsed.dim];
  if(custom&&custom!=="auto")return custom;
 }
 if(parsed.dim==="temperature")return sys==="imperial"?"F":"C";
 if(parsed.dim==="mass")return sys==="imperial"?"lb":"kg";
 if(parsed.dim==="volume")return sys==="imperial"?"gal":"L";
 if(parsed.dim==="area")return sys==="imperial"?"sqft":"m2";
 if(parsed.dim==="length"){
   if(sys==="imperial") return Math.abs(parsed.base)>=1609.344?"mi":"ft";
   return Math.abs(parsed.base)>=1000?"km":(Math.abs(parsed.base)>=2?"m":"cm");
 }
 return parsed.unit;
}
let prefs={targetCurrencies:["USD","RUB"],enabledCategories:{currency:true,units:true},preferredSystem:"metric",tooltipTheme:"dark"};chrome.runtime.sendMessage({type:"prefs"},r=>{if(r&&r.ok)prefs=r.prefs});chrome.storage.onChanged.addListener(()=>chrome.runtime.sendMessage({type:"prefs"},r=>{if(r&&r.ok)prefs=r.prefs}));
let timer;document.addEventListener("mouseup",queue,true);document.addEventListener("keyup",queue,true);document.addEventListener("selectionchange",queue,true);document.addEventListener("mousedown",e=>{if(!e.target.closest?.("#svc-tooltip"))hide()},true);window.addEventListener("scroll",hide,true);
function queue(){clearTimeout(timer);timer=setTimeout(handle,120)}
async function handle(){const sel=window.getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return hide();const text=clean(sel.toString());if(!text||text.length>120)return hide();const rect=sel.getRangeAt(0).getBoundingClientRect();if(!rect.width&&!rect.height)return hide();try{if(prefs.enabledCategories?.currency!==false){const c=parseCurrency(text);if(c){const targets=(prefs.targetCurrencies||["EUR","RUB","USD"]).filter(x=>x!==c.code);const res=await chrome.runtime.sendMessage({type:"convert",payload:{amount:c.amount,from:c.code,targets}});if(res?.ok){const vals=Object.entries(res.result.converted||{}).map(([code,val])=>fmtCurrency(val,code));if(vals.length)return show(rect,text,vals,`${res.result.source} · ${c.code}`)}}}if(prefs.enabledCategories?.units!==false){const u=parseUnit(text);if(u)return show(rect,text,[u],"unit conversion");}}catch(e){console.warn("SVC failed",e);}}
function parseCurrency(text){for(const p of curPatterns){const m=text.match(p);if(!m?.groups)continue;const amount=parseNum(m.groups.num);const code=currencyFrom(m.groups.cur);if(Number.isFinite(amount)&&code)return{amount,code};}return null}
function currencyFrom(token){const norm=normAlias(token);const hit=ALIASES.find(x=>normAlias(x.alias)===norm);return hit?.code||null}
function parseUnit(text){
 let m=text.match(/^\s*(?<ft>\d+(?:[.,]\d+)?)\s*(?:ft|feet|foot|'|′)\s*(?<inch>\d+(?:[.,]\d+)?)\s*(?:in|inch|inches|"|″)\s*$/i);
 let parsed=null;
 if(m?.groups){
   const ft=parseNum(m.groups.ft),inch=parseNum(m.groups.inch);
   parsed={dim:"length",system:"imperial",unit:"ft+in",base:(ft*12+inch)*0.0254};
 } else {
   const aliasList=[];for(const u of UNIT_ALIASES)for(const a of u.aliases)aliasList.push({u,a});
   aliasList.sort((a,b)=>b.a.length-a.a.length);
   const re=new RegExp(`^\\s*(?<num>${NUM})\\s*(?<unit>${aliasList.map(x=>esc(x.a)).join("|")})\\s*$`,"iu");
   m=text.match(re);if(!m?.groups)return null;
   const val=parseNum(m.groups.num);const item=aliasList.find(x=>normAlias(x.a)===normAlias(m.groups.unit));
   if(!item||!Number.isFinite(val))return null;
   parsed={dim:item.u.dim,system:item.u.system,unit:item.u.unit,base:item.u.toBase(val)};
 }
 let target=chooseUnit(parsed);
 if(parsed.unit===target)return null;
 const [val,label]=fromBase(parsed.dim,target,parsed.base);
 return `${round(val)} ${label}`;
}
function parseNum(s){let v=String(s).replace(/\u00A0/g," ").replace(/\s/g,"").replace(/'/g,"");const lc=v.lastIndexOf(","),ld=v.lastIndexOf(".");if(lc>-1&&ld>-1)v=lc>ld?v.replace(/\./g,"").replace(",","."):v.replace(/,/g,"");else if(lc>-1)v=v.replace(/,/g,".");return Number(v)}
function show(rect,original,vals,meta){hide();const el=document.createElement("div");el.id="svc-tooltip";el.className=(prefs.tooltipTheme==="light"?"svc-light":"svc-dark");el.innerHTML=`<div class="svc-original">${escapeHtml(original)}</div><div class="svc-result">≈ ${vals.map(escapeHtml).join(" | ")}</div><div class="svc-meta">${escapeHtml(meta)}</div>`;document.documentElement.appendChild(el);const top=Math.max(8,rect.top+window.scrollY-el.offsetHeight-12),left=Math.max(8,Math.min(rect.left+window.scrollX,window.scrollX+innerWidth-el.offsetWidth-8));el.style.top=top+"px";el.style.left=left+"px";}
function hide(){document.getElementById("svc-tooltip")?.remove()}function clean(s){return String(s||"").replace(/\u00A0/g," ").replace(/[\n\t]+/g," ").replace(/\s+/g," ").trim()}function esc(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function normAlias(s){return String(s).toLowerCase().replace(/\s+/g," ").trim()}function round(n){return Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}function fmtCurrency(n,c){try{return new Intl.NumberFormat(undefined,{style:"currency",currency:c,maximumFractionDigits:2}).format(n)}catch{return `${round(n)} ${c}`}}function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]))}
