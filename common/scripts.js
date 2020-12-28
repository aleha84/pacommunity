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

  function getParameterCaseInsensitive(object, key) {
    return object[Object.keys(object)
      .find(k => k.toLowerCase() === key.toLowerCase())
    ];
  }

  class ListRenderer {
    constructor(usersData, params = { isCommon: false, renderFlag: false }) {
        this.users = [];
        this.params = params;
        this.languages = Object.values(usersData.Languages);
        this.currentLanguage = usersData.Lang;

        if(this.params.isCommon){
            this.currentLanguage = {};
        }
        
        this.users = Object.values(usersData.Users);
        this.template = this.getRowTemplate();
        this.parentNode = document.querySelector('.listItemsHolder');
        this.defaultSort = { type: "followers", direction: "desc" };

        this.currentSort = {...this.defaultSort};
        this.formatter = new Intl.NumberFormat();

        document.querySelector('body').addEventListener('click', function(evt) {
            if (evt.target.className.startsWith('followersCount') || evt.target.className.startsWith('tweetsCount')) {
              let userId = evt.target.closest('.userDataHolder').getAttribute('userid');
              showGraph(userId);
            }
        }, true);

        this.createOtherListsLinks();

        this.sort();
    }
    createOtherListsLinks() {
        let holder = document.querySelector('.otherLists');
        holder.textContent = '';

        let index = 0;
        this.languages.forEach((l, i) => {
            if(l.Id == this.currentLanguage.Id)
                return;

            let a = document.createElement('a');
            if(this.params.isCommon) {
                a.setAttribute('href', `${l.Id}/`);
            }
            else {
                a.setAttribute('href', `../${l.Id}/`);
            }

            a.classList.add('flag', l.Id);
            a.innerText = `${l.Adjective} list`;
            
            holder.appendChild(a);

            if(index++ % 2 != 0) {

                holder.appendChild(document.createElement('br'));
            }

        });

        if(!this.params.isCommon) {
            holder.appendChild(document.createElement('br'));
            let a = document.createElement('a');
            a.setAttribute('href', '../');
            a.innerText = 'Common list';
            holder.appendChild(a);
        }
    }
    getRowTemplate() {
        let t = document.createElement('template');
        t.innerHTML = `
        <div class="userDataHolder listItemData">
          <div class="userImageHolder">
            <img class="userImage" />
          </div>
          <div class="userHrefHolder">
            <a class="userHref" target="_blank" href=""></a>
          </div>
          <div class="followersCountHolder" title="Show followers count graph">
            <span class="followersCount"></span>
          </div>
          <div class="tweetsCountHolder" title="Show tweets count graph">
            <span class="tweetsCount"></span>
          </div>
        </div>
        `;

        return t;
    }
    getContributorsList() {
        return [
            'YuukiMokuya',
            'MarukiHurakami',
            'Numo_0',
            'runmry',
        ]
    }
    formatNumberSafe(number) {
        try {
            return this.formatter.format(number);
        }
        catch {
            return number;
        }
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
                href.setAttribute('title', `${ud.PublicName} (${ud.Login})`);
                href.textContent = ud.PublicName;

                if(this.params.renderFlag) {
                    href.classList.add('flag')
                    href.classList.add(ud.LangId)
                }
        
                userDataDiv.querySelector('.followersCount').textContent = this.formatNumberSafe(ud.CurrentFollowersCount);
                userDataDiv.querySelector('.tweetsCount').textContent = this.formatNumberSafe(ud.CurrentTweetsCout);
        
                userDataDiv.querySelector('.userDataHolder').setAttribute('userid', ud.Login);
        
                this.parentNode.appendChild(userDataDiv)
              });
        }, 10)
    }
  }
