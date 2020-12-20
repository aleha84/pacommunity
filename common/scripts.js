// TODO: remove lang specific methods, make them more generic

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

  function setLangBr(event) {
    changeLang('br')
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
    displayNone(".help>.br");
  
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

  class ListRenderer {
    constructor(usersData, template, parentNode) {
        this.users = Object.values(usersData.Users);
        this.template = template;
        this.parentNode = parentNode;

        this.defaultSort = { type: "followers", direction: "desc" };

        this.currentSort = {...this.defaultSort};

        this.sort();
    }

    sortUsers(a, b) {
        let p1 = a;
        let p2 = b;
        if(this.currentSort.direction == "desc"){
            p1 = b;
            p2 = a;
        }
    
        if(this.currentSort.type == 'followers'){
            return p1.CurrentFollowersCount - p2.CurrentFollowersCount;
        }

        if(this.currentSort.type == "tweets") {
            return p1.CurrentTweetsCout - p2.CurrentTweetsCout;
        }

        if(this.currentSort.type == "name") {
            return ('' + p1.PublicName).localeCompare(p2.PublicName)
        }
    
        return 0;
    }
    
    sort(type) {
        if(type) {
            if(this.currentSort.type == type) {
                this.currentSort.direction = this.currentSort.direction == 'asc' ? 'desc' : 'asc';
            }
            else {
                this.currentSort.type = type;
                this.currentSort.direction = "desc";
            }
        }
        
        let selector; //= " .sortDirection";
        switch(this.currentSort.type) {
            case "followers":
                selector = ".followersCountHolder";
                break;
            case "tweets":
                selector = ".tweetsCountHolder"
                break;
            case "name":
                selector = ".userHrefHolder";
                break;
            default:
                break;
        }

        let elements = document.getElementsByClassName("sortDirection");
        while (elements.length > 0) elements[0].remove();

        let dir = document.createElement("span");
        dir.classList.add('sortDirection')
        dir.classList.add(this.currentSort.direction)
        document.querySelector(selector).appendChild(dir)
        
        this.render();
    }

    render() {
        this.parentNode.textContent = '';

        setTimeout(() => {
            this.users.sort((a,b) => this.sortUsers(a, b)).forEach(ud => {
                let userDataDiv = document.importNode(this.template.content, true);
        
                userDataDiv.querySelector('.userImage').setAttribute('src', ud.AvatarImage);
                let href = userDataDiv.querySelector('.userHref');
                href.setAttribute('href', 'https://twitter.com/' + ud.Login)
                href.setAttribute('title', ud.PublicName);
                href.textContent = ud.PublicName;
        
                userDataDiv.querySelector('.followersCount').textContent = ud.CurrentFollowersCount;
                userDataDiv.querySelector('.tweetsCount').textContent = ud.CurrentTweetsCout;
        
                userDataDiv.querySelector('.userDataHolder').setAttribute('userid', ud.Login);
        
                this.parentNode.appendChild(userDataDiv)
              });
        }, 10)
    }
  }
