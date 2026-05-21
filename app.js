var arts=[],fbs=[],isAdm=false,curCat='Semua',curTab='terbaru',sCat='Semua';
var selTags=[],selHT=[],curArt=null,audPlay=false,audInt=null,fbOk=false,imgB64='',editId=null;
var CATS=['Nasional','Internasional','Teknologi','Ekonomi','Hiburan','Olahraga','Lifestyle'];
var HTS=['NEW','BREAKING','TRENDING','EXCLUSIVE','UPDATE','FLASH'];
var STAGS=['politik','indonesia','dunia','ekonomi','teknologi','sosial','hukum'];
var PWD='KABARNUSANTARA';
var SHARES=[
  {n:'WhatsApp',c:'#25D366',i:'W',u:function(t,l){return'https://wa.me/?text='+encodeURIComponent(t+' '+l)}},
  {n:'Telegram',c:'#229ED9',i:'TG',u:function(t,l){return'https://t.me/share/url?url='+encodeURIComponent(l)+'&text='+encodeURIComponent(t)}},
  {n:'X',c:'#000',i:'X',u:function(t,l){return'https://twitter.com/intent/tweet?text='+encodeURIComponent(t)+'&url='+encodeURIComponent(l)}},
  {n:'Instagram',c:'#E1306C',i:'IG',u:function(){return'https://www.instagram.com/'}},
  {n:'TikTok',c:'#010101',i:'TK',u:function(){return'https://www.tiktok.com/'}},
  {n:'Facebook',c:'#1877F2',i:'FB',u:function(t,l){return'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(l)}},
  {n:'Salin Link',c:'#555',i:'&#10697;',u:null}
];

window.addEventListener('fb_ready',function(){
  fbOk=true;
  var F=window.KN_FB;
  F.onSnapshot(F.query(F.collection(F.db,'articles'),F.orderBy('createdAt','desc')),function(s){
    arts=s.docs.map(function(d){return Object.assign({id:d.id},d.data())});
    rp(curPage);
  },function(){loadLoc()});
  F.onSnapshot(F.query(F.collection(F.db,'feedbacks'),F.orderBy('createdAt','desc')),function(s){
    fbs=s.docs.map(function(d){return Object.assign({id:d.id},d.data())});
    var ib=document.getElementById('ad-inbox');
    if(ib&&ib.style.display!=='none')rInbox();
  },function(){});
});
setTimeout(function(){if(!fbOk)loadLoc();},7000);

function loadLoc(){
  try{arts=JSON.parse(localStorage.getItem('kn_arts')||'[]');}catch(e){}
  rp(curPage);
}

var curPage='home';
function go(p){
  if(p==='admin'&&!isAdm)return;
  document.querySelectorAll('.pg').forEach(function(e){e.classList.remove('show')});
  document.getElementById('pg-'+p).classList.add('show');
  document.querySelectorAll('.nbtn').forEach(function(e){e.classList.remove('on')});
  var nb=document.getElementById('nb-'+p);if(nb)nb.classList.add('on');
  curPage=p;window.scrollTo(0,0);rp(p);
}
function rp(p){
  if(p==='home')rHome();
  if(p==='berita')rBerita();
  if(p==='search')rSearch();
  if(p==='admin')rAdmin();
}

function rHome(){
  rCats('hcats',curCat,function(c){curCat=c;rHome();});
  var pub=getPub(),sorted=srt(pub),hl=pub.slice(0,3);
  var hlsec=document.getElementById('hl-sec');
  if(hl.length){hlsec.style.display='';document.getElementById('hl-grid').innerHTML=hl.map(cHTML).join('');}
  else hlsec.style.display='none';
  var filt=sorted.filter(function(a){return curCat==='Semua'||a.category===curCat});
  document.getElementById('hgrid').innerHTML=filt.length?filt.map(cHTML).join(''):emHTML('Belum ada berita.');
  doGeo(pub);
}
function rBerita(){
  rCats('bcats',curCat,function(c){curCat=c;rBerita();});
  var pub=getPub(),filt=pub.filter(function(a){return curCat==='Semua'||a.category===curCat});
  document.getElementById('bgrid').innerHTML=filt.length?filt.map(cHTML).join(''):emHTML('Belum ada berita.');
}
function rSearch(){rCats('scats',sCat,function(c){sCat=c;doSearch();});}
function doSearch(){
  var q=(document.getElementById('s-input').value||'').toLowerCase();
  var res=getPub().filter(function(a){
    var mq=!q||[a.title,a.shortDesc,a.category,a.subCategory].some(function(s){return s&&s.toLowerCase().indexOf(q)>=0});
    return mq&&(sCat==='Semua'||a.category===sCat);
  });
  document.getElementById('s-count').textContent=(q||sCat!=='Semua')?res.length+' hasil ditemukan':'';
  document.getElementById('sgrid').innerHTML=res.length?res.map(cHTML).join(''):(q||sCat!=='Semua'?emHTML('Tidak ada hasil.'):'');
}
function rAdmin(){setAt('create');rManage();rTL();rInbox();}

function cHTML(a){
  var img=a.imageUrl?'<img class="cimg" src="'+xe(a.imageUrl)+'" alt="" onerror="this.style.display=\'none\'">':'<div class="cph">&#9670;</div>';
  var tags=(a.headlineTags||[]).map(function(t){return'<span class="ht '+t+'">'+t+'</span>'}).join('');
  return'<div class="card" onclick="openArt(\''+a.id+'\')">'+img+'<div class="cbody"><div class="ctags">'+tags+'</div><div class="ccat">'+xe(a.subCategory||a.category)+' &middot; '+xe(a.category)+'</div><div class="ctitle">'+xe(a.title)+'</div>'+(a.shortDesc?'<div class="cdesc">'+xe(a.shortDesc)+'</div>':'')+'<div class="cmeta"><span>By '+xe(a.author||'Tim Redaksi')+'</span><span>'+(a.readTime||5)+' min</span><span>&#128065; '+(a.views||0)+'</span><span style="margin-left:auto">'+fmtD(a.publishedAt||a.createdAt)+'</span></div></div></div>';
}

function openArt(id){
  var a=arts.find(function(x){return x.id===id});if(!a)return;
  curArt=a;
  if(fbOk&&window.KN_FB){var F=window.KN_FB;F.updateDoc(F.doc(F.db,'articles',id),{views:F.increment(1)}).catch(function(){});}
  rArtPage(a);go('article');
}
function rArtPage(a){
  stopAud();
  var pub=getPub();
  var rel=pub.filter(function(x){return x.id!==a.id&&x.category===a.category}).slice(0,3);
  var sbtns=SHARES.map(function(p){var url=p.u?p.u(a.title,location.href):'copy';return'<button class="shbtn" style="background:'+p.c+'" onclick="doShare(\''+p.n+'\',\''+url+'\')">'+p.i+' '+p.n+'</button>';}).join('');
  var tagsH=(a.tags||[]).map(function(t){return'<span class="atpill">#'+xe(t)+'</span>'}).join('');
  var relH=rel.map(function(r,i){return'<div class="relitem" onclick="openArt(\''+r.id+'\')"><span class="relnum">'+(i+1)+'</span><div><div class="relcat">'+xe(r.category)+'</div><div class="reltitle">'+xe(r.title)+'</div></div></div>';}).join('');
  var h='<button class="backbtn" onclick="go(\'berita\')">&#8592; Kembali</button>';
  if(a.imageUrl)h+='<img class="ahero" src="'+xe(a.imageUrl)+'" alt="" onerror="this.remove()">';
  h+='<div class="ctags" style="margin-bottom:.65rem">'+(a.headlineTags||[]).map(function(t){return'<span class="ht '+t+'">'+t+'</span>'}).join('')+'</div>';
  h+='<div class="acat">'+xe(a.subCategory||a.category)+' &middot; '+xe(a.category)+'</div>';
  h+='<h1 class="atitle">'+xe(a.title)+'</h1>';
  if(a.shortDesc)h+='<p class="asub">'+xe(a.shortDesc)+'</p>';
  h+='<div class="abyline"><span>By <strong>'+xe(a.author||'Tim Redaksi Kabar Nusantara')+'</strong></span>'+(a.translator?'<span>Translator: <strong>'+xe(a.translator)+'</strong></span>':'')+'<span>'+fmtD(a.publishedAt||a.createdAt)+'</span><span>&#128065; '+(a.views||0)+' Views</span></div>';
  h+='<div class="audio-bar"><button class="abtn" id="aud-btn" onclick="togAud()">&#9654;</button><div><div class="albl">Audio Artikel</div><div class="asublbl" id="aud-sub">Dengarkan artikel ini</div></div><div class="aprog"><div class="afill" id="aud-fill"></div></div></div>';
  h+='<div class="abody">'+(a.content||'Konten artikel belum tersedia.').split('\n').map(function(p){return p?'<p>'+xe(p)+'</p>':''}).join('')+'</div>';
  if(a.source)h+='<div class="srctag">Sumber: <a href="'+xe(a.source)+'" target="_blank" rel="noreferrer">'+xe(a.source)+'</a></div>';
  if(tagsH)h+='<div class="atags2">'+tagsH+'</div>';
  h+='<div class="sharesec"><div class="sharelbl">Bagikan Artikel</div><div class="sharebtns">'+sbtns+'</div></div>';
  if(rel.length)h+='<div class="relsec"><div class="rellbl">Artikel Lainnya</div>'+relH+'</div>';
  document.getElementById('art-content').innerHTML=h;
}

function togAud(){
  if(!curArt)return;if(!window.speechSynthesis){toast('Browser tidak mendukung TTS');return;}
  if(audPlay){stopAud();return;}
  var txt=curArt.title+'. '+(curArt.shortDesc||'')+'. '+(curArt.content||'');
  var u=new SpeechSynthesisUtterance(txt);u.lang='id-ID';u.rate=0.95;
  var t0=Date.now(),est=txt.length*60;
  audInt=setInterval(function(){var f=document.getElementById('aud-fill');if(f)f.style.width=Math.min((Date.now()-t0)/est*100,99)+'%';},200);
  u.onend=function(){audPlay=false;clearInterval(audInt);var b=document.getElementById('aud-btn');if(b)b.innerHTML='&#9654;';var s=document.getElementById('aud-sub');if(s)s.textContent='Selesai diputar';var f=document.getElementById('aud-fill');if(f)f.style.width='100%';};
  speechSynthesis.speak(u);audPlay=true;
  var b=document.getElementById('aud-btn');if(b)b.innerHTML='&#9632;';
  var s=document.getElementById('aud-sub');if(s)s.textContent='Sedang diputar...';
}
function stopAud(){if(audPlay){speechSynthesis.cancel();audPlay=false;clearInterval(audInt);}}

function doShare(nm,url){
  if(nm==='Salin Link'){if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(function(){toast('Link disalin!')});return;}
  window.open(url,'_blank');
  if(fbOk&&window.KN_FB&&curArt){var F=window.KN_FB;F.updateDoc(F.doc(F.db,'articles',curArt.id),{shares:F.increment(1)}).catch(function(){});}
}

function saveArt(status){
  var title=(document.getElementById('f-title').value||'').trim();
  if(!title){toast('Judul artikel wajib diisi.');return;}
  var btn=document.getElementById('pub-btn');btn.disabled=true;btn.textContent='Menyimpan...';
  var imgUrl=imgB64||document.getElementById('img-url').value.trim();
  var data={title:title,status:status,category:document.getElementById('f-cat').value,subCategory:document.getElementById('f-subcat').value,headlineTags:selHT.slice(),readTime:document.getElementById('f-rt').value,author:document.getElementById('f-author').value,translator:document.getElementById('f-trans').value,shortDesc:document.getElementById('f-sdesc').value,content:document.getElementById('f-body').value,tags:selTags.slice(),source:document.getElementById('f-src').value,seoTitle:document.getElementById('f-seot').value,seoDesc:document.getElementById('f-seod').value,imageUrl:imgUrl};
  if(editId){
    if(fbOk&&window.KN_FB){
      var F=window.KN_FB;data.updatedAt=F.serverTimestamp();
      F.updateDoc(F.doc(F.db,'articles',editId),data).then(function(){toast('Artikel berhasil diperbarui!');resetForm();btn.disabled=false;btn.textContent='Publikasikan';}).catch(function(e){toast('Gagal: '+e.message);btn.disabled=false;btn.textContent='Publikasikan';});
    } else {
      arts=arts.map(function(a){return a.id===editId?Object.assign({},a,data):a});
      try{localStorage.setItem('kn_arts',JSON.stringify(arts));}catch(e){}
      toast('Diperbarui (offline).');resetForm();btn.disabled=false;btn.textContent='Publikasikan';
    }
  } else {
    data.views=0;data.shares=0;
    if(fbOk&&window.KN_FB){
      var F=window.KN_FB;data.createdAt=F.serverTimestamp();if(status==='Published')data.publishedAt=F.serverTimestamp();
      F.addDoc(F.collection(F.db,'articles'),data).then(function(){toast(status==='Published'?'Artikel dipublikasikan!':'Tersimpan sebagai draft.');resetForm();btn.disabled=false;btn.textContent='Publikasikan';}).catch(function(e){toast('Gagal: '+e.message);btn.disabled=false;btn.textContent='Publikasikan';});
    } else {
      data.id=Date.now().toString();data.createdAt={toDate:function(){return new Date()}};
      arts.unshift(data);try{localStorage.setItem('kn_arts',JSON.stringify(arts));}catch(e){}
      toast('Disimpan (offline).');resetForm();btn.disabled=false;btn.textContent='Publikasikan';
    }
  }
}

function editArt(id){
  var a=arts.find(function(x){return x.id===id});if(!a)return;
  editId=id;setAt('create');
  document.getElementById('form-mode-lbl').textContent='Edit Artikel';
  document.getElementById('pub-btn').textContent='Simpan Perubahan';
  document.getElementById('cancel-edit-btn').style.display='';
  var m={title:'f-title',subCategory:'f-subcat',readTime:'f-rt',author:'f-author',translator:'f-trans',shortDesc:'f-sdesc',content:'f-body',source:'f-src',seoTitle:'f-seot',seoDesc:'f-seod'};
  Object.keys(m).forEach(function(k){var el=document.getElementById(m[k]);if(el)el.value=a[k]||'';});
  var fc=document.getElementById('f-cat');for(var i=0;i<fc.options.length;i++){if(fc.options[i].value===a.category){fc.selectedIndex=i;break;}}
  selHT=(a.headlineTags||[]).slice();selTags=(a.tags||[]).slice();imgB64='';
  document.getElementById('img-url').value=a.imageUrl&&!a.imageUrl.startsWith('data:')?a.imageUrl:'';
  if(a.imageUrl)showPrev(a.imageUrl);
  rHTbtns();rTagPills();
  toast('Mode edit aktif. Ubah lalu klik Simpan Perubahan.');
  window.scrollTo(0,0);
}

function delArt(id){
  if(!confirm('Hapus artikel ini? Tidak bisa dibatalkan.'))return;
  if(fbOk&&window.KN_FB){var F=window.KN_FB;F.deleteDoc(F.doc(F.db,'articles',id)).then(function(){toast('Artikel dihapus.');}).catch(function(e){toast('Gagal: '+e.message);});}
  else{arts=arts.filter(function(a){return a.id!==id});try{localStorage.setItem('kn_arts',JSON.stringify(arts));}catch(e){}rManage();toast('Dihapus.');}
}

function resetForm(){
  editId=null;
  ['f-title','f-subcat','f-sdesc','f-body','f-src','f-seot','f-seod','f-trans','img-url'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('f-rt').value='5';document.getElementById('f-author').value='Kabar Nusantara';
  selTags=[];selHT=[];imgB64='';
  var p=document.getElementById('img-prev');if(p){p.style.display='none';p.src='';}
  document.getElementById('up-hint').style.display='';
  document.getElementById('form-mode-lbl').textContent='Buat Artikel Baru';
  document.getElementById('pub-btn').textContent='Publikasikan';
  document.getElementById('cancel-edit-btn').style.display='none';
  rHTbtns();rTagPills();
}
function prevArt(){
  var title=document.getElementById('f-title').value;if(!title){toast('Isi judul dulu.');return;}
  var fake={id:'_prev',title:title,category:document.getElementById('f-cat').value,subCategory:document.getElementById('f-subcat').value,headlineTags:selHT.slice(),readTime:document.getElementById('f-rt').value,author:document.getElementById('f-author').value,shortDesc:document.getElementById('f-sdesc').value,content:document.getElementById('f-body').value,tags:selTags.slice(),source:document.getElementById('f-src').value,imageUrl:imgB64||document.getElementById('img-url').value,views:0};
  curArt=fake;rArtPage(fake);go('article');
}

function rManage(){
  var pub=getPub(),drft=arts.filter(function(a){return a.status!=='Published'});
  document.getElementById('mg-count').textContent=pub.length+' Dipublikasikan \u00b7 '+drft.length+' Draft';
  document.getElementById('mg-list').innerHTML=arts.length
    ?arts.map(function(a){return'<div class="mgitem">'+(a.imageUrl?'<img class="mgthmb" src="'+xe(a.imageUrl)+'" onerror="this.style.display=\'none\'" alt="">':'<div class="mgthmb" style="display:flex;align-items:center;justify-content:center;color:var(--mu)">&#9670;</div>')+'<div class="mginfo"><div class="mgtit">'+xe(a.title)+'</div><div class="mgmt">'+xe(a.category)+' \u00b7 <span style="color:'+(a.status==='Published'?'#2E7D32':'#E65100')+'">'+a.status+'</span> \u00b7 &#128065; '+(a.views||0)+' \u00b7 '+fmtD(a.publishedAt||a.createdAt)+'</div></div><div class="mgbtns"><button class="editbtn" onclick="editArt(\''+a.id+'\')">&#9998; Edit</button><button class="delbtn" onclick="delArt(\''+a.id+'\')">&#128465; Hapus</button></div></div>';}).join('')
    :emHTML('Belum ada artikel.');
}
function rTL(){
  document.getElementById('tl-list').innerHTML=arts.slice(0,15).length
    ?arts.slice(0,15).map(function(a){return'<div class="tli"><div class="tlt">'+fmtD(a.updatedAt||a.publishedAt||a.createdAt)+(a.updatedAt?' \u00b7 <span style="color:var(--red)">Diedit</span>':'')+'</div><div class="tlc">'+xe(a.category)+' \u00b7 '+a.status+'</div><div class="tln">'+xe(a.title)+'</div></div>';}).join('')
    :emHTML('Belum ada data.');
}
function rInbox(){
  document.getElementById('inbox-list').innerHTML=fbs.length
    ?fbs.map(function(f){return'<div class="fbi"><div class="fbm">'+fmtD(f.createdAt)+' \u00b7 '+(f.type||'masukkan')+'</div><div class="fbt">'+xe(f.text)+'</div></div>';}).join('')
    :emHTML('Belum ada masukkan.');
}

function chkHoax(){
  var q=(document.getElementById('hoax-in').value||'').trim();if(!q){toast('Masukkan klaim.');return;}
  var btn=document.getElementById('hoax-btn'),res=document.getElementById('hoax-res');
  btn.disabled=true;btn.textContent='Memeriksa...';res.style.display='block';res.className='hres unclear';res.textContent='Memeriksa dengan AI...';
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:'Kamu adalah pemeriksa fakta profesional Indonesia. Analisis klaim berikut.\n\nKlaim: "'+q+'"\n\nJawab format:\nVERDIK: [FAKTA/HOAX/TIDAK DAPAT DIPASTIKAN]\nPENJELASAN: [2-3 kalimat dalam Bahasa Indonesia]'}]})})
  .then(function(r){return r.json()}).then(function(d){var txt=(d.content&&d.content[0]&&d.content[0].text)||'';res.className='hres '+(txt.indexOf('HOAX')>=0?'hoax':txt.indexOf('FAKTA')>=0?'fakta':'unclear');res.textContent=txt;})
  .catch(function(){res.className='hres unclear';res.textContent='Gagal memeriksa.';})
  .finally(function(){btn.disabled=false;btn.textContent='Cek Sekarang';});
}

function saveSet(){
  var inp=(document.getElementById('fb-input').value||'').trim();
  if(inp===PWD){isAdm=true;document.getElementById('nb-admin').style.display='';document.getElementById('logout-adm').style.display='';document.getElementById('fb-input').value='';toast('Selamat datang, Admin!');return;}
  if(inp){if(fbOk&&window.KN_FB){var F=window.KN_FB;F.addDoc(F.collection(F.db,'feedbacks'),{text:inp,createdAt:F.serverTimestamp(),type:'masukkan'}).catch(function(){});}toast('Masukkan terkirim. Terima kasih!');document.getElementById('fb-input').value='';}
  else toast('Pengaturan disimpan.');
}
function logoutAdm(){isAdm=false;document.getElementById('nb-admin').style.display='none';document.getElementById('logout-adm').style.display='none';toast('Keluar dari mode Admin.');}

function setTheme(dk){document.body.classList.toggle('dk',dk);document.getElementById('t-light').classList.toggle('on',!dk);document.getElementById('t-dark').classList.toggle('on',dk);}
function setFs(s){document.body.style.fontSize={small:'14px',medium:'16px',large:'18px'}[s];['small','medium','large'].forEach(function(x){document.getElementById('fs-'+x).classList.toggle('on',x===s)});}
function setCp(on){document.getElementById('cp-on').classList.toggle('on',on);document.getElementById('cp-off').classList.toggle('on',!on);}

function setAt(t){
  ['create','manage','timeline','hoax','inbox'].forEach(function(x){document.getElementById('ad-'+x).style.display=x===t?'':'none';document.getElementById('at-'+x).classList.toggle('on',x===t);});
  if(t==='manage')rManage();if(t==='timeline')rTL();if(t==='inbox')rInbox();
}
function setTab(t){curTab=t;['terbaru','trending','populer'].forEach(function(x){document.getElementById('tt-'+x).classList.toggle('on',x===t)});rHome();}

function rCats(id,active,cb){
  document.getElementById(id).innerHTML=['Semua'].concat(CATS).map(function(c){return'<button class="cbtn'+(active===c?' on':'')+'" onclick="('+cb.toString()+')(\''+c+'\')">'+c+'</button>';}).join('');
}
function rHTbtns(){document.getElementById('ht-btns').innerHTML=HTS.concat(selHT.filter(function(t){return HTS.indexOf(t)<0})).map(function(t){return'<button class="cbtn'+(selHT.indexOf(t)>=0?' on':'')+'" onclick="togHT(\''+t+'\')">'+t+'</button>';}).join('');}
function togHT(t){selHT=selHT.indexOf(t)>=0?selHT.filter(function(x){return x!==t}):selHT.concat([t]);rHTbtns();}
function addHT(e){if(e.key==='Enter')addHTclick();}
function addHTclick(){var v=(document.getElementById('ht-custom').value||'').trim().toUpperCase();if(v&&selHT.indexOf(v)<0)selHT.push(v);rHTbtns();document.getElementById('ht-custom').value='';}
function rTagPills(){
  document.getElementById('tag-pills').innerHTML=STAGS.map(function(t){return'<button class="cbtn'+(selTags.indexOf(t)>=0?' on':'')+'" style="font-size:.68rem;padding:.2rem .55rem" onclick="togTag(\''+t+'\')">&#35;'+t+'</button>';}).join('')
    +selTags.filter(function(t){return STAGS.indexOf(t)<0}).map(function(t){return'<span class="tpill">&#35;'+xe(t)+'<button onclick="rmTag(\''+t+'\')">&#10005;</button></span>';}).join('');
}
function togTag(t){selTags=selTags.indexOf(t)>=0?selTags.filter(function(x){return x!==t}):selTags.concat([t]);rTagPills();}
function rmTag(t){selTags=selTags.filter(function(x){return x!==t});rTagPills();}
function addTag(e){if(e.key==='Enter')addTagC();}
function addTagC(){var v=(document.getElementById('tag-custom').value||'').trim();if(v&&selTags.indexOf(v)<0)selTags.push(v);rTagPills();document.getElementById('tag-custom').value='';}

function handleImg(e){var f=e.target&&e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){imgB64=ev.target.result;showPrev(imgB64);};r.readAsDataURL(f);}
function prevUrl(){var u=(document.getElementById('img-url').value||'').trim();if(u){imgB64='';showPrev(u);}}
function showPrev(src){var p=document.getElementById('img-prev');p.src=src;p.style.display='block';document.getElementById('up-hint').style.display='none';}

function doGeo(pub){
  if(!navigator.geolocation)return;
  navigator.geolocation.getCurrentPosition(function(pos){
    fetch('https://nominatim.openstreetmap.org/reverse?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&format=json')
      .then(function(r){return r.json()}).then(function(d){
        var city=(d.address&&(d.address.city||d.address.town||d.address.state))||'Lokasi Anda';
        document.getElementById('nb-city').textContent=city;
        var loc=pub.filter(function(a){return a.category==='Nasional'}).slice(0,3);
        if(loc.length){
          document.getElementById('nb-sec').style.display='';
          document.getElementById('nb-list').innerHTML=loc.map(function(a){return'<div class="nbitem" onclick="openArt(\''+a.id+'\')"><div style="font-family:var(--fu);font-size:.62rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">'+xe(a.category)+'</div><div style="font-family:var(--fd);font-weight:700;font-size:.85rem;line-height:1.28">'+xe(a.title)+'</div></div>';}).join('');
        }
      }).catch(function(){});
  },function(){});
}

function getPub(){return arts.filter(function(a){return a.status==='Published'});}
function srt(arr){return arr.slice().sort(function(a,b){if(curTab==='trending')return(b.views||0)-(a.views||0);if(curTab==='populer')return(b.shares||0)-(a.shares||0);return 0;});}
function fmtD(ts){if(!ts)return'';var d=ts&&ts.toDate?ts.toDate():new Date(ts);if(!d||isNaN(d.getTime()))return'';return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+' \u00b7 '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+' WIB';}
function xe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function emHTML(m){return'<div class="empty"><div class="eico">&#9670;</div><div>'+m+'</div></div>';}
var toastT;
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(function(){t.style.display='none';},3500);}

rHTbtns();rTagPills();rHome();
