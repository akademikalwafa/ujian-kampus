// UJIAN KAMPUS — SPA: navigasi 0ms, cache lokal (stale-while-revalidate), sync latar belakang
const $=i=>document.getElementById(i),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S=JSON.parse(localStorage.uk||'{"role":"","jadwal":[],"bank":[],"dosen":[],"set":{}}'),T=sessionStorage.tk,KOP=localStorage.kop||'',curNav='home',LB=new Set();
const persist=()=>localStorage.uk=JSON.stringify(S),adm=()=>S.role==='admin',isAr=k=>/ma.?had/i.test(k||'');
function toast(m,e){const t=$('toast');t.textContent=m;t.className='s'+(e?' e':'');clearTimeout(t._);t._=setTimeout(()=>t.className='',2800)}
async function api(a,d){const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:a,token:T,data:d})}).then(r=>r.json());
 if(r.code==401){logout();throw Error(r.message)}if(!r.success)throw Error(r.message);return r.data}
const bg=(a,d,ok)=>{$('sync').textContent='Menyinkronkan…';return api(a,d).then(x=>{$('sync').textContent='Tersinkron';ok&&ok(x)}).catch(e=>{$('sync').textContent='Gagal sinkron';toast(e.message,1)})};
const boot=()=>api('boot').then(d=>{S=Object.assign(S,d);persist();renderAll();$('sync').textContent='Tersinkron'}).catch(e=>$('sync').textContent='Offline (data lokal)');
function logout(){sessionStorage.removeItem('tk');T=null;$('app').hidden=true;$('login').hidden=false}
window.onload=()=>{const iv=setInterval(()=>{if(!window.google?.accounts)return;clearInterval(iv);
 google.accounts.id.initialize({client_id:CLIENT_ID,callback:r=>{T=r.credential;sessionStorage.tk=T;start()}});
 google.accounts.id.renderButton($('gbtn'),{theme:'outline',size:'large',text:'signin_with'})},100);if(T)start()};
const NAVS=[['home','Beranda'],['soal','Buat Soal',1],['label','Label Map',1],['bank','Bank Soal'],['jadwal','Data Jadwal',1],['set','Pengaturan',1]];
function start(){$('login').hidden=true;$('app').hidden=false;if(!$('views').children.length)build();renderAll();nav(S.role==='dosen'?'bank':(location.hash.slice(1)||'home'));boot();
 if(!KOP&&adm())bg('getKop',0,k=>{KOP=k;try{localStorage.kop=k}catch(e){}renderSoal()})}
function nav(p){if(!adm()&&p!=='bank')p='bank';curNav=p;document.querySelectorAll('.v').forEach(v=>v.classList.toggle('on',v.id==='v-'+p));
 document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===p));$('ttl').textContent=NAVS.find(n=>n[0]===p)[1];$('side').classList.remove('show');location.hash=p;scrollTo(0,0)}
function build(){$('nav').innerHTML=NAVS.map(n=>`<a data-p="${n[0]}" class="${n[2]?'adm':''}" onclick="nav('${n[0]}')">${n[1]}</a>`).join('');
 $('views').innerHTML=`<div class="view" id="vw">
<section class="v" id="v-home"></section>
<section class="v" id="v-soal"><h2>Buat Soal</h2><p class="sub">Identitas terisi otomatis dari Data Jadwal. Pratinjau langsung.</p><div class="g2"><div class="box">
<div class="row"><div><label>Jenis</label><select id="f_jenis"><option>UTS<option selected>UAS</select></div><div><label>Tahun Ajaran</label><input id="f_ta" value="2025/2026"></div><div><label>Semester</label><select id="f_sem"><option>Ganjil<option selected>Genap</select></div></div>
<div class="row"><div><label>Kelas</label><select id="f_kelas"></select></div><div><label>Mata Kuliah</label><select id="f_mk"></select></div></div>
<div class="row"><div><label>Dosen</label><input id="f_dosen"></div><div><label>Prodi</label><input id="f_prodi"></div><div><label>Semester/Level</label><input id="f_smt"></div></div>
<div class="row"><div><label>Hari</label><input id="f_hari"></div><div><label>Tanggal</label><input id="f_tgl"></div><div><label>Jam</label><input id="f_jam"></div><div><label>Durasi</label><input id="f_dur" value="90 menit"></div></div>
<div class="row"><div><label>Sifat</label><input id="f_sifat" value="Tutup Buku"></div><div><label>Font (pt)</label><select id="f_fs"><option>12<option selected>14<option>16</select></div><div><label>Per A4</label><select id="f_two"><option value="">1 salinan<option value="1">2 salinan</select></div></div>
<label>Teks Soal (paste di sini)</label><textarea id="f_soal" placeholder="1. ..."></textarea>
<div class="row"><button class="p" onclick="savePdf()">Simpan PDF & Masukkan Bank Soal</button><button onclick="printNow()">Cetak</button></div></div>
<div class="pv" id="pvs"></div></div></section>
<section class="v" id="v-label"><h2>Label Map Ujian</h2><p class="sub">A4 dibagi 10 (2×5) atau ukuran KTP. Pilih jadwal.</p><div class="g2"><div class="box"><div class="row"><select id="l_sz" onchange="renderLabel()"><option value="a4">A4 ÷ 10 (105×59,4 mm)<option value="ktp">KTP (85,6×54 mm)</select><select id="l_jn" onchange="renderLabel()"><option>UTS<option selected>UAS</select></div><div class="row"><button onclick="LB=new Set(S.jadwal.map(j=>j.ID));renderLabel()">Pilih semua</button><button onclick="LB.clear();renderLabel()">Kosongkan</button></div><div id="l_list" style="max-height:420px;overflow:auto"></div><div class="row"><button class="p" onclick="saveLabel()">Simpan PDF Label</button></div></div><div class="pv" id="pvl"></div></div></section>
<section class="v" id="v-bank"><h2>Bank Soal & Arsip</h2><p class="sub" id="b_sub"></p><div class="box"><div class="row"><input id="b_q" placeholder="Cari mata kuliah, dosen, nama berkas…" oninput="renderBank()"><select id="b_j" onchange="renderBank()"><option value="">UTS & UAS<option>UTS<option>UAS</select><select id="b_k" onchange="renderBank()"></select>
<span class="adm"><button class="p" onclick="$('b_up').click()">+ Unggah Berkas</button><input id="b_up" type="file" hidden multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onchange="upBank(this.files)"></span></div><div class="tw"><table><thead><tr><th>Tipe<th>Berkas & Mata Kuliah<th>Kelas<th>Jenis<th>T.A<th>Dosen<th></tr></thead><tbody id="b_t"></tbody></table></div></div></section>
<section class="v" id="v-jadwal"><h2>Data Jadwal</h2><p class="sub">Impor CSV (Excel → Simpan sebagai CSV) dengan kolom: SMT, KELAS, MATA_KULIAH, DOSEN_1, DOSEN_2, HARI, WAKTU, MATKUL_ARAB, DOSEN_ARAB, PRODI.</p><div class="box"><div class="row"><input id="j_q" placeholder="Cari…" oninput="renderJadwal()"><button class="p" onclick="$('j_f').click()">Impor CSV</button><input id="j_f" type="file" hidden accept=".csv,.txt" onchange="impJadwal(this.files[0])"><button onclick="addJ()">+ Tambah Baris</button></div><div class="tw"><table><thead><tr><th>Smt<th>Kelas<th>Mata Kuliah<th>Arab<th>Dosen 1<th>Hari & Jam<th></tr></thead><tbody id="j_t"></tbody></table></div></div></section>
<section class="v" id="v-set"><h2>Pengaturan</h2><div class="g2"><div class="box"><h3>Kop Kampus (full-bleed A4)</h3><input type="file" accept="image/*" onchange="upKop(this.files[0])"><div class="row"><div><label>Offset teks dari atas (mm)</label><input id="s_off" type="number" onchange="setS()"></div><div><label>Margin kiri/kanan (mm)</label><input id="s_mar" type="number" onchange="setS()"></div></div><p class="sub">Gambar kop akan menutupi bagian atas lembar tanpa margin.</p></div>
<div class="box"><h3>Daftar Email Dosen (whitelist)</h3><div class="row"><input id="d_e" placeholder="email"><input id="d_n" placeholder="nama"><button class="p" onclick="addD()">Tambah</button></div><div class="tw"><table><tbody id="d_t"></tbody></table></div></div></div></section></div>`;
 ['f_jenis','f_ta','f_sem','f_dosen','f_prodi','f_smt','f_hari','f_tgl','f_jam','f_dur','f_sifat','f_fs','f_two','f_soal'].forEach(i=>$(i).addEventListener('input',renderSoal));
 $('f_kelas').onchange=()=>{fillMk();renderSoal()};$('f_mk').onchange=()=>{fillId();renderSoal()};
 window.onresize=zoomAll}
function renderAll(){$('vw').className='view '+S.role;$('usr').textContent=(S.email||'')+' · '+S.role;document.querySelectorAll('#nav a').forEach(a=>a.hidden=!adm()&&a.dataset.p!=='bank'&&a.dataset.p!=='home'?true:false);
 renderHome();renderBank();if(adm()){fillKelas();renderJadwal();renderSet();renderLabel();renderSoal()}}
function renderHome(){const sc=(l,v,p)=>`<div class="box stat ${p?'sc':''}" ${p?`onclick="nav('${p}')"`:''}>${l}<b>${v}</b></div>`;
 $('v-home').innerHTML=`<h2>Selamat Datang</h2><p class="sub">Kelola naskah ujian UTS/UAS, label map, dan Bank Soal.</p><div class="g">${sc('Mata kuliah terjadwal',S.jadwal.length,adm()&&'jadwal')}${sc('Berkas Bank Soal',S.bank.length,'bank')}${sc('Dosen terdaftar',S.dosen.length,adm()&&'set')}</div>
 <div class="g adm">${[['soal','Buat Soal','Lembar A4 + kop'],['label','Label Map','Siap potong'],['bank','Bank Soal','Arsip & unggah'],['jadwal','Data Jadwal','Impor & edit']].map(x=>`<div class="box sc" onclick="nav('${x[0]}')"><b>${x[1]}</b><br><small>${x[2]}</small></div>`).join('')}</div>`}
// ===== Bank Soal
function renderBank(){const q=($('b_q')?.value||'').toLowerCase(),j=$('b_j').value,k=$('b_k');const ks=[...new Set(S.bank.map(b=>b.KELAS).filter(Boolean))];
 if(k.options.length!==ks.length+1){const v=k.value;k.innerHTML='<option value="">Semua kelas'+ks.map(x=>`<option>${esc(x)}`).join('');k.value=v}
 $('b_sub').textContent=S.bank.length+' berkas'+(adm()?'':' — hanya lihat & unduh');
 $('b_t').innerHTML=S.bank.filter(b=>(!j||b.JENIS_UJIAN===j)&&(!k.value||b.KELAS===k.value)&&(JSON.stringify(b).toLowerCase().includes(q))).map(b=>`<tr><td><span class="tag">${esc(b.TIPE)}</span><td><b>${esc(b.MATA_KULIAH)}</b><br><small>${esc(b.NAMA_FILE)}</small><td>${esc(b.KELAS)}<td>${esc(b.JENIS_UJIAN)}<td>${esc(b.TAHUN_AJARAN)}<td>${esc(b.DOSEN)}<td><a class="btn" href="https://drive.google.com/uc?export=download&id=${esc(b.ID_FILE_DRIVE)}" target="_blank">Unduh</a><span class="adm"> <button onclick="renB('${b.ID}')">Ubah</button> <button onclick="delB('${b.ID}')">Hapus</button></span>`).join('')||'<tr><td colspan=7>Belum ada berkas.'}
const b64=f=>new Promise(r=>{const x=new FileReader;x.onload=()=>r(x.result.split(',')[1]);x.readAsDataURL(f)});
async function upBank(fs){const mk=prompt('Nama mata kuliah untuk berkas ini:');if(!mk)return;const jn=prompt('Jenis ujian (UTS/UAS):','UAS')||'UAS',ta=prompt('Tahun ajaran:','2025/2026')||'';toast('Mengunggah…');
 const items=[];for(const f of fs)items.push({name:f.name,mime:f.type||'application/octet-stream',b64:await b64(f),meta:{MATA_KULIAH:mk,JENIS_UJIAN:jn.toUpperCase(),TAHUN_AJARAN:ta,SUMBER:'Diunggah'}});
 bg('uploadBank',items,r=>{S.bank=r;persist();renderAll();toast('Berkas tersimpan')})}
function renB(id){const b=S.bank.find(x=>x.ID===id),n=prompt('Nama berkas baru:',b.NAMA_FILE);if(!n)return;b.NAMA_FILE=n;persist();renderBank();bg('bankEdit',{id,name:n})}
function delB(id){if(!confirm('Hapus berkas ini?'))return;S.bank=S.bank.filter(x=>x.ID!==id);persist();renderBank();bg('bankDel',{id})}
// ===== Data Jadwal
const JC='SMT,KELAS,MATA_KULIAH,DOSEN_1,DOSEN_2,HARI,WAKTU,MATKUL_ARAB,DOSEN_ARAB,PRODI'.split(',');
function renderJadwal(){const q=($('j_q').value||'').toLowerCase(),seen={};
 $('j_t').innerHTML=S.jadwal.filter(j=>JSON.stringify(j).toLowerCase().includes(q)).map(j=>{const k=j.SMT+j.KELAS+j.MATA_KULIAH,d=seen[k]++;seen[k]=1;return`<tr><td>${esc(j.SMT)}<td><span class="tag">${esc(j.KELAS)}</span><td>${esc(j.MATA_KULIAH)}<td class="ar">${esc(j.MATKUL_ARAB)}<td>${esc(j.DOSEN_1)}<td>${esc(j.HARI)} ${esc(j.WAKTU)}<td><button onclick="delJ('${j.ID}')">Hapus</button>`}).join('')||'<tr><td colspan=7>Belum ada data.'}
const saveJ=()=>{persist();renderAll();bg('saveJadwal',S.jadwal)};
function parseCSV(t){const d=t.split('\n')[0].includes(';')?';':',',rows=[];let r=[],c='',q=0;for(const ch of t.replace(/\r/g,'')){if(ch=='"')q=!q;else if(ch==d&&!q){r.push(c);c=''}else if(ch=='\n'&&!q){r.push(c);rows.push(r);r=[];c=''}else c+=ch}r.push(c);rows.push(r);return rows.filter(x=>x.join('').trim())}
async function impJadwal(f){if(!f)return;const R=parseCSV(await f.text()),H=R[0].map(h=>h.trim().toUpperCase().replace(/[ .]+/g,'_'));
 const rows=R.slice(1).map(r=>{const o={ID:crypto.randomUUID()};JC.forEach(c=>o[c]=(r[H.indexOf(c)]||'').trim());return o}).filter(o=>o.MATA_KULIAH);
 S.jadwal=S.jadwal.concat(rows);saveJ();toast(rows.length+' baris diimpor')}
function addJ(){const o={ID:crypto.randomUUID()};JC.forEach(c=>o[c]=prompt(c)||'');if(!o.MATA_KULIAH)return;S.jadwal.push(o);saveJ()}
function delJ(id){S.jadwal=S.jadwal.filter(j=>j.ID!==id);saveJ()}
// ===== Pengaturan
function renderSet(){$('s_off').value=S.set.OFFSET||45;$('s_mar').value=S.set.MARGIN||20;
 $('d_t').innerHTML=S.dosen.map(d=>`<tr><td>${esc(d.NAMA)}<br><small>${esc(d.EMAIL)}</small><td><button onclick="togD('${esc(d.EMAIL)}')">${String(d.STATUS_AKTIF)==='false'?'Aktifkan':'Nonaktifkan'}</button> <button onclick="delD('${esc(d.EMAIL)}')">Hapus</button>`).join('')}
const saveD=()=>{persist();renderSet();$('vw')&&renderHome();bg('saveDosen',S.dosen)};
function addD(){const e=$('d_e').value.trim().toLowerCase();if(!e)return;S.dosen.push({EMAIL:e,NAMA:$('d_n').value,STATUS_AKTIF:true});$('d_e').value=$('d_n').value='';saveD()}
function togD(e){const d=S.dosen.find(x=>x.EMAIL===e);d.STATUS_AKTIF=String(d.STATUS_AKTIF)==='false';saveD()}
function delD(e){S.dosen=S.dosen.filter(x=>x.EMAIL!==e);saveD()}
function setS(){S.set.OFFSET=$('s_off').value;S.set.MARGIN=$('s_mar').value;persist();renderSoal();bg('saveSet',S.set)}
async function upKop(f){if(!f)return;const r=new FileReader;r.onload=()=>{KOP=r.result;try{localStorage.kop=KOP}catch(e){}renderSoal();toast('Kop diperbarui')};r.readAsDataURL(f);
 bg('saveKop',{name:f.name,mime:f.type,b64:await b64(f)})}
// ===== Buat Soal (pratinjau instan di browser)
const uniq=a=>[...new Set(a.filter(Boolean))];
function fillKelas(){const k=$('f_kelas');if(k.options.length)return;k.innerHTML=uniq(S.jadwal.map(j=>j.KELAS)).map(x=>`<option>${esc(x)}`).join('');fillMk()}
function fillMk(){$('f_mk').innerHTML=S.jadwal.filter(j=>j.KELAS===$('f_kelas').value).map(j=>`<option value="${j.ID}">${esc(j.MATA_KULIAH)}`).join('');fillId()}
function fillId(){const j=S.jadwal.find(x=>x.ID===$('f_mk').value);if(!j)return;const a=isAr(j.KELAS);
 $('f_dosen').value=a?(j.DOSEN_ARAB||j.DOSEN_1):j.DOSEN_1;$('f_prodi').value=j.PRODI||'';$('f_smt').value=j.SMT;$('f_hari').value=j.HARI;$('f_jam').value=j.WAKTU}
function paper(){const v=i=>esc($(i).value),j=S.jadwal.find(x=>x.ID===$('f_mk').value)||{},a=isAr(j.KELAS),mm=x=>x*3.78,off=mm(+S.set.OFFSET||45),mar=mm(+S.set.MARGIN||20),fs=$('f_fs').value+'pt',two=$('f_two').value;
 const mk=a?(j.MATKUL_ARAB||j.MATA_KULIAH):j.MATA_KULIAH,tt=$('f_jenis').value==='UTS'?'TENGAH':'AKHIR';
 const hd=KOP?'':`<div class="ih" style="margin-bottom:8px">SEKOLAH TINGGI ILMU SYARIAH AL WAFA BOGOR</div>`;
 const ttl=a?`<div class="ih ar">الاختبار ${tt==='AKHIR'?'لنهاية':'لنصف'} الفصل — ${v('f_ta')}</div>`:`<div class="ih">UJIAN ${tt} SEMESTER (${v('f_jenis')}) ${v('f_sem').toUpperCase()} T.A ${v('f_ta')}</div>`;
 const L=a?[['المادة',mk],['المدرس',v('f_dosen')],['المستوى',v('f_smt')],['اليوم',v('f_hari')+' '+v('f_tgl')],['الوقت',v('f_jam')+' ('+v('f_dur')+')'],['اسم الطالب','']]:[['Mata Kuliah',esc(mk)],['Dosen Pengampu',v('f_dosen')],['Prodi / Smt',v('f_prodi')+' / '+v('f_smt')],['Sifat',v('f_sifat')],['Hari/Tanggal',v('f_hari')+', '+v('f_tgl')],['Jam',v('f_jam')+' ('+v('f_dur')+')'],['Nama Mahasiswa','................']];
 const inner=`<div class="pi ${a?'ar':''}" style="padding:${two?mm(14):off}px ${two?mm(10):mar}px 30px;font-size:${fs}">${hd}${ttl}<div class="idt">${L.map(x=>`<div><b>${x[0]}:</b> ${x[1]}</div>`).join('')}</div><div class="body">${v('f_soal')}</div></div>`;
 const bgs=KOP&&!two?`background-image:url(${KOP})`:'';
 return two?`<div class="pg l"><div class="hf">${inner}</div><div class="hf">${inner}</div></div>`:`<div class="pg" style="${bgs}">${inner}</div>`}
function zoomAll(){document.querySelectorAll('.pv').forEach(p=>{const g=p.firstElementChild;if(!g)return;g.style.zoom=1;const z=(p.clientWidth-16)/g.offsetWidth;g.style.zoom=Math.min(z,1)})}
function renderSoal(){if(!$('f_mk').value&&$('f_kelas').options.length)fillMk();$('pvs').innerHTML=paper();zoomAll()}
// ===== Label Map
function labelHtml(j){const a=isAr(j.KELAS),jn=$('l_jn').value;return a?`<div class="lb ar"><h4>نص الأسئلة</h4><div>المادة: ${esc(j.MATKUL_ARAB||j.MATA_KULIAH)}</div><div>المدرس: ${esc(j.DOSEN_ARAB||j.DOSEN_1)}</div><div>المستوى: ${esc(j.SMT)}</div><div>${esc(j.HARI)} ${esc(j.WAKTU)}</div></div>`
 :`<div class="lb"><h4>NASKAH SOAL ${jn}</h4><div><b>Mata Kuliah:</b> ${esc(j.MATA_KULIAH)}</div><div><b>Dosen:</b> ${esc(j.DOSEN_1)}</div><div><b>Prodi/Smt:</b> ${esc(j.PRODI)} / ${esc(j.SMT)} · ${esc(j.KELAS)}</div><div>${esc(j.HARI)}, ${esc(j.WAKTU)}</div></div>`}
function labelPages(){const sel=S.jadwal.filter(j=>LB.has(j.ID)),ktp=$('l_sz').value==='ktp',pgs=[];for(let i=0;i<Math.max(sel.length,1);i+=10){const c=sel.slice(i,i+10);while(c.length<10&&sel.length)c.push(null);
 pgs.push(`<div class="pg" style="padding:7mm"><div class="lg">${c.map(j=>`<div style="padding:${ktp?'2mm 9mm':0};overflow:hidden">${j?labelHtml(j):''}</div>`).join('')}</div></div>`)}return pgs}
function renderLabel(){$('l_list').innerHTML=S.jadwal.map(j=>`<label style="text-transform:none;font-size:13px;color:inherit"><input type="checkbox" style="width:auto" ${LB.has(j.ID)?'checked':''} onchange="this.checked?LB.add('${j.ID}'):LB.delete('${j.ID}');renderLabel()"> ${esc(j.MATA_KULIAH)} <span class="tag">${esc(j.KELAS)}</span></label>`).join('');$('pvl').innerHTML=labelPages()[0];zoomAll()}
// ===== PDF (dibuat di browser, diunggah ke Drive)
async function toPdf(pages,land){const {jsPDF}=window.jspdf,doc=new jsPDF(land?'l':'p','mm','a4'),h=document.createElement('div');h.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(h);
 for(let i=0;i<pages.length;i++){h.innerHTML=pages[i];const c=await html2canvas(h.firstElementChild,{scale:2,useCORS:true});if(i)doc.addPage('a4',land?'l':'p');doc.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,land?297:210,land?210:297)}
 h.remove();return doc}
async function savePdf(){const j=S.jadwal.find(x=>x.ID===$('f_mk').value);if(!j)return toast('Pilih mata kuliah',1);toast('Membuat PDF…');
 const d=await toPdf([paper()],!!$('f_two').value),name=`${$('f_jenis').value}_${$('f_sem').value}_${$('f_ta').value.replace('/','-')}_${j.MATA_KULIAH.replace(/\W+/g,'_')}.pdf`;
 const meta={MATA_KULIAH:j.MATA_KULIAH,KELAS:j.KELAS,SMT:j.SMT,JENIS_UJIAN:$('f_jenis').value,TAHUN_AJARAN:$('f_ta').value,SEMESTER:$('f_sem').value,DOSEN:j.DOSEN_1,SUMBER:'Dibuat di aplikasi'};
 d.save(name);bg('uploadBank',[{name,mime:'application/pdf',b64:d.output('datauristring').split(',')[1],meta}],r=>{S.bank=r;persist();renderBank();toast('PDF masuk Bank Soal')})}
async function saveLabel(){if(!LB.size)return toast('Pilih jadwal',1);toast('Membuat PDF…');(await toPdf(labelPages())).save('Label_Map_'+$('l_jn').value+'.pdf')}
function printNow(){$('pr').innerHTML=curNav==='label'?labelPages().join(''):paper();setTimeout(print,50)}
