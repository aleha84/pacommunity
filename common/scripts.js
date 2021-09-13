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
  
  function getSafeByPath(obj, path, defaultValue){
    if(!obj)
      return defaultValue != undefined ? defaultValue : undefined;
  
    if(!path)
      return obj;
  
    let pathParts = path.split('.');
    let _subObj = obj;
    try{
      for(let i = 0; i < pathParts.length; i++){
        _subObj = caseInsencitivePropertyGetter(_subObj, pathParts[i]);
        if(_subObj == undefined)
          return defaultValue != undefined ? '' : undefined;
      }
    }
    catch {
      return defaultValue != undefined ? '' : undefined;
    }
  
    return _subObj;
  }
  
  function caseInsencitivePropertyGetter(obj, propName){
    if(obj == undefined || obj == null)
      return;
  
    let keys = Object.keys(obj).filter(k => k.toLowerCase() == propName.toLowerCase());
    if(!keys.length)
      return undefined;
  
    return obj[keys[0]];
  }

function displayNone(selector) {
    let element = document.querySelector(selector);
    if(element){
        element.style.display = "none";
    }
}
function getLocationHashObject() {
    let hash = location.hash;
    if(hash[0] == '#')
        hash = hash.substring(1);

    return parseParams(hash);
}

function parseParams(str) {
    var pieces = str.split("&"), data = {}, i, parts;
    // process each query pair
    for (i = 0; i < pieces.length; i++) {
        parts = pieces[i].split("=");
        if (parts.length < 2) {
            parts.push("");
        }
        data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return data;
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

  function createListLinks(languages, currentLanguageId, params) {
    let holder = document.querySelector('.otherLists');
    holder.textContent = '';

    let index = 0;
    languages.forEach((l, i) => {
        if(l.Id == currentLanguageId)
            return;

        let a = document.createElement('a');

        let href = '';

        if(params.isCommon) {
            if(l.Other) {
                href = `more/#lang=${l.Id}`;
            }
            else {
                href = `${l.Id}/`;
            }
        }
        else {
            if(l.Other) {
                href = `../more/#lang=${l.Id}`;
            }
            else {
                href = `../${l.Id}/`;
            }
        }

        a.setAttribute('href', href);

        a.classList.add('flag', l.Id);
        a.innerText = `${l.Adjective} list`;
        
        holder.appendChild(a);

        if(index++ % 2 != 0) {

            holder.appendChild(document.createElement('br'));
        }

    });


    if(!params.isCommon) {
        holder.appendChild(document.createElement('br'));
        let a = document.createElement('a');
        a.setAttribute('href', '../');
        a.innerText = 'Common list';
        holder.appendChild(a);
    }
  }

  function createCommonOverlay({containerStyles, containerClassNames = [], checkCanClose = (event) => true}) {
    let commonOverlay = document.getElementById('commonOverlay');
    if (commonOverlay) {
        commonOverlay.remove();
        commonOverlay = undefined;
    }

    commonOverlay = document.createElement('div');
    commonOverlay.classList.add('overlay');
    commonOverlay.classList.add('commonOverlay');
    commonOverlay.style.display = "block";

    let close = () => {
        commonOverlay.remove();
        commonOverlay = undefined;
        document.documentElement.style.overflow = 'scroll';
        document.body.scroll = "yes";
    }

    commonOverlay.onclick = function(event) {
        if(!checkCanClose(event))
            return;
        
        close();
    }

    let container = document.createElement('div');
    container.classList.add('container');
    container.classList.add(...containerClassNames)

    Object.keys(containerStyles).forEach(key => {
        container.style[key] = containerStyles[key];
    })

    commonOverlay.appendChild(container);

    document.body.appendChild(commonOverlay);
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";

    container.closeOverlay = close;

    return container;
  }

  function bodyClickHandler(evt) {
    if (evt.target.className.startsWith('followersCount') || evt.target.className.startsWith('tweetsCount')) {
      let userId = evt.target.closest('.userDataHolder').getAttribute('userid');
      showGraph(userId);
    }
  }

  class ListRenderer {
    constructor(usersData, params = {}) {
        this.users = [];
        this.params = Object.assign({ isOther: false, isCommon: false, renderFlag: false, rootFolderPath: '../../', commissions: {} }, params);
        this.languages = Object.values(usersData.Languages);
        this.currentLanguage = usersData.Lang;
        this.updateDate = usersData.LastTimeUpdate;

        if(this.params.isCommon){
            this.currentLanguage = {};
        }
        else {
            if(!this.currentLanguage.Adjective) {
                this.currentLanguage.Adjective = usersData.Languages[this.currentLanguage.Id].Adjective
            }
        }
        
        this.users = Object.values(usersData.Users);
        this.template = this.getRowTemplate();
        this.parentNode = document.querySelector('.listItemsHolder');
        this.defaultSort = { type: "followers", direction: "desc" };

        this.currentSort = {...this.defaultSort};
        this.formatter = new Intl.NumberFormat();

        let body = document.querySelector('body');

        body.removeEventListener('click', bodyClickHandler);
        body.addEventListener('click', bodyClickHandler, true);

        if(!this.params.isOther)
            this.createOtherListsLinks();
        else {
            document.querySelector('.pageHeader>h3').innerText = `${this.currentLanguage.Adjective} speaking pixel artists list`
        }

        this.createHelp();
    }
    async start() {    
        let created = document.querySelector('.created');
        let search = document.querySelector('.search');
        let feedback = document.querySelector('.feedback');

        if(created)
            created.remove();

        let v = '6.6.21';
        if(!search) {
            let searchResponse = await fetch(this.params.rootFolderPath + 'common/html/search.html?v=' + v);
            let searchHtml = await searchResponse.text();
            document.getElementsByClassName('otherLists')[0].insertAdjacentHTML('beforebegin', searchHtml)
        }

        if(!feedback){
            let feedbackResponse = await fetch(this.params.rootFolderPath + 'common/html/feedback.html?v=' + v);
            let feedbackHtml = await feedbackResponse.text();

            document.getElementsByClassName('pageHeader')[0].insertAdjacentHTML('afterbegin', feedbackHtml)
        }

        let footerResponse = await fetch(this.params.rootFolderPath + 'common/html/footer.html?v=' + v);
        let footerHtml = await footerResponse.text();

        let cResponse = await fetch(this.params.rootFolderPath + 'common/commissions.json?q='+ new Date().getTime());
        let cData = await cResponse.json();

        this.params.commissions = cData;

        document.body.insertAdjacentHTML('beforeend', footerHtml)

        this.sort();
        this.createContributorsLink();

        let koFiScript = document.createElement('script');
        koFiScript.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
        document.body.appendChild(koFiScript);
        setTimeout(() => {
  kofiWidgetOverlay.draw('aleha_84', {
    'type': 'floating-chat',
    'floating-chat.donateButton.text': 'Support',
    'floating-chat.donateButton.background-color': '#323842',
    'floating-chat.donateButton.text-color': '#fff'
  });



        },10)
    }
    createOtherListsLinks() {
        createListLinks(this.languages, this.currentLanguage.Id, this.params)
    }
    getRowTemplate() {
        let t = document.createElement('template');
        t.innerHTML = `
        <div class="userDataHolder listItemData">
            <div class="commissionHolder">
                <a class="commissionHref usdSign" target="_blank" href=""></a>
            </div>
          <div class="userImageHolder">
            <img class="userImage" />
          </div>
          <div class="userHrefHolder">
            <a class="userHref" target="_blank" href=""></a>
          </div>
          <div class="followersCountHolder">
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
            'D44W33D'
        ]
    }

    createContributorsLink() {
        let link = document.createElement('div');
        link.textContent = 'Contributors';
        link.classList.add('contributors');
        //link.classList.contains

        link.onclick = () => {
            let co = createCommonOverlay({ containerStyles: { 
                'width': '50%',
                'text-align': 'center',
                'padding': '20px 0',
                'border': '1px solid black',
                'padding-bottom': '40px'
             }, checkCanClose: function(event) {
                return !event.target.classList.contains('contributor');
             },
             containerClassNames: ['contributors']
             });

             let title = document.createElement('h3');
             title.style.color = 'black';
             title.textContent = "People who helped me alot"
             co.appendChild(title);

            let ul = document.createElement('ul');
            ul.classList.add('styleNone')
            this.getContributorsList().forEach(str => {
                let li =document.createElement('li'); 
                let a = document.createElement('a');
                a.textContent = str;
                a.setAttribute('href', 'https://twitter.com/' + str)
                a.setAttribute('target', '_blank')
                a.classList.add('contributor')

                li.appendChild(a)
                ul.appendChild(li);
            })

            co.appendChild(ul);
        }

        let created = document.querySelector('.created')
        let updateDate = document.createElement('div');
        updateDate.innerText = 'Data updated at: ' + this.updateDate;
        updateDate.classList.add('updatedAt');

        created.appendChild(updateDate);
        created.appendChild(link);
    }
    
    createHelp() {
        let enData = [
            "Hello everyone! This is a list of {adjective} pixel artists. I created this because I wanted to join information together and share it with everyone around, and also to code a little. Data is updated daily (for now manually)",
              "I plan to support and develop this page with pure enthusiasm: searching for new artists, add new features to the page and automate data updates. Also, if there is interest, I will be happy to create similar lists for other languages.",
              "If you know pixel artists I haven't mentioned on this list, or if you find a bug/mistake, then let me know. Bookmark this page to your browser and share or retweet to let more people know about these wonderful and talented people",
        ]

        let enHolder = document.querySelector('.help>.en');
        enHolder.textContent = '';

        let langAdjective = this.currentLanguage.Adjective || '';

        if(langAdjective && !this.params.isCommon) {
            langAdjective += ' speaking';
        }

        enData.forEach(str => {
            let p = document.createElement('p');
            p.textContent = str.replace('{adjective}', langAdjective);

            enHolder.appendChild(p);
        })
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

        if(this.currentSort.type == "trend") {
            return getSafeByPath(p1, 'FollowersTrend.WeeklyGrowth', -100) - getSafeByPath(p2, 'FollowersTrend.WeeklyGrowth', -100);
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
            case "trend":
                selector = ".trendHolder";
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

    search(s) {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") { console.log('useSearch ym - local host; do nothing');  } 
        else {
            if(ym){
                try {
                    ym(70569073,'reachGoal','useSearch')
                }
                catch(exception) {
                    console.log(exception);
                }
            }

            if(gtag) {
                try {
                    gtag('event', 'useSearch', { 'event_label': s });
                }
                catch(exception) {
                    console.log(exception);
                }
            }
        }

        if(!s || s.length < 3)
            return;

        s = s.toLowerCase();

        let listItems = document.querySelectorAll('.userDataHolder.listItemData .userHref');
        let elementToFocus = undefined
        listItems.forEach(element => {
            if(element.title.toLowerCase().indexOf(s) != -1){
                elementToFocus = element;
                return;
            }
        });

        if(!elementToFocus){
            alert('Not found')
        }
        else {
            let row = elementToFocus.parentNode.parentNode;
            row.classList.add('highlight')
            setTimeout(() =>  {
                row.classList.add('highlightRemove')
            }, 10)

            setTimeout(() =>  {
                row.classList.remove('highlight', 'highlightRemove')
            }, 1100)
            row.scrollIntoView();
        }

    }

    render() {
        this.parentNode.textContent = '';

        let co = undefined;

        if(this.params.isCommon) {
            co = createCommonOverlay({ containerStyles: { 
                'background-color': 'transparent',
                'text-align': 'center',
                }
            });
            let title = document.createElement('h1');
            title.textContent = 'Loading';
    
            co.appendChild(title)
        }
        
        setTimeout(() => {
            this.users.sort((a,b) => this.sortUsers(a, b)).forEach(ud => {
                let userDataDiv = document.importNode(this.template.content, true);
        
                let commission =  getParameterCaseInsensitive(this.params.commissions,ud.Login);
                let commissionHolder = userDataDiv.querySelector('.commissionHolder');
                if(commission){
                    if(commission.description){
                        commissionHolder.title = commission.description;
                    }

                    let cHref = commission.link;
                    if(!cHref){
                        cHref = 'https://twitter.com/' + ud.Login;
                    }
                    commissionHolder.querySelector('.commissionHref').setAttribute('href', cHref);
                }
                else {
                    commissionHolder.remove();
                }

                userDataDiv.querySelector('.userImage').setAttribute('src', ud.AvatarImage);
                let href = userDataDiv.querySelector('.userHref');
                href.setAttribute('href', 'https://twitter.com/' + ud.Login)
                href.setAttribute('title', `${ud.PublicName} (${ud.Login})`);
                href.textContent = ud.PublicName;

                if(this.params.renderFlag) {
                    href.classList.add('flag')
                    href.classList.add(ud.LangId)
                }
        
                let followersCountEl = userDataDiv.querySelector('.followersCount');
                if(ud.FollowersTrend){
                    if(!ud.FollowersTrend.ErrorMessage) {
                        let trendClassName = 'mid_gray';
                        let wg = ud.FollowersTrend.WeeklyGrowth;

                        if(wg > 0.5)
                            trendClassName = 'up_yellow';
                        if(wg > 2.5)
                            trendClassName = 'double_up_yellow';
                        if(wg > 5)
                            trendClassName = 'up_green';
                        if(wg > 7.5)
                            trendClassName = 'double_up_green';
                        if(wg < -0.5)
                            trendClassName = 'down_yellow';
                        if(wg < -2.5)
                            trendClassName = 'double_down_yellow';
                        if(wg < -5)
                            trendClassName = 'down_red';
                        if(wg < -7.5)
                            trendClassName = 'double_down_red';

                        followersCountEl.classList.add('trend', trendClassName)

                        followersCountEl.title = 'Weekly followers growth trend: ' + wg.toFixed(2) + '%';
                    }
                    else {
                        followersCountEl.classList.add('trend', 'noData');
                        followersCountEl.title = "No trend data awailable";
                    }
                }
                else {
                    followersCountEl.classList.add('trend', 'noData');
                    followersCountEl.title = "No trend data awailable";
                }

                followersCountEl.textContent = this.formatNumberSafe(ud.CurrentFollowersCount);
                userDataDiv.querySelector('.tweetsCount').textContent = this.formatNumberSafe(ud.CurrentTweetsCout);
        
                userDataDiv.querySelector('.userDataHolder').setAttribute('userid', ud.Login);
        
                this.parentNode.appendChild(userDataDiv)
              });

              if(co){
                co.closeOverlay();
              } 
        }, 10)
    }
  }

  function createToTopBtn() {
    setTimeout(() => {
        let btn = document.createElement('button')
        btn.innerText = 'Top';
        btn.classList.add('toTop');

        btn.onclick = () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        }
  
        document.body.appendChild(btn)

        window.addEventListener('scroll', function(e) { 
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                btn.style.display = "block";
            } else {
                btn.style.display = "none";
            }
        })
    }, 10)  
    
  }

  document.addEventListener("DOMContentLoaded", () => {
    createToTopBtn()
  })
  
