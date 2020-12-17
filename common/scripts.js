function setLangRu(event) {
    changeLang('ru')
    event.stopPropagation();
  }
  
  function setLangEn(event) {
    changeLang('en')
    event.stopPropagation();
  }
  
  function changeLang(lang) {
    document.querySelector(".help>.en").style.display = "none";
    document.querySelector(".help>.ru").style.display = "none";
  
    document.querySelector(".help>." + lang).style.display = "block";
  
  
  }
  
  function helpShow() {
    document.getElementById("help").style.display = "block";
  
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
  }
  
  function helpHide(event) {
    document.getElementById("help").style.display = "none";
  
    document.documentElement.style.overflow = 'scroll';
   document.body.scroll = "yes";
  }
  
  function rawDateStringToIsoString(rawDateString) {
    if(!rawDateString)
      return;
    let p1 = rawDateString.slice(0, 6) + ' ' + rawDateString.slice(6)
    return p1.slice(0, 4) + ' ' + p1.slice(4) + ' 00:00:00 UTC'
  }