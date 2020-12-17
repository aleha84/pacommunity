function setLangRu(event) {
    changeLang('ru')
    event.stopPropagation();
  }

  function setLangDe(event) {
    changeLang('de')
    event.stopPropagation();
  }
  
  function setLangEn(event) {
    changeLang('en')
    event.stopPropagation();
  }
  
function displayNone(selector) {
    let element = document.querySelector(selector);
    if(element){
        element.style.display = "none";
    }
}

  function changeLang(lang) {
    displayNone(".help>.en");
    displayNone(".help>.ru");
    displayNone(".help>.de");
  
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