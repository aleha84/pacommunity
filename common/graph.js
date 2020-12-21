function showGraph(userid) {
    let user = getParameterCaseInsensitive(usersData.Users, userid);
    //usersData.Users[userid];
    //console.log(user)
    if (!user) {
        console.log('No user found: ' + userid);
        return;
    }

    let data = [[], [], []];
    
    Object.keys(user.FollowersCountHistory).forEach(item => {
        let countData = user.FollowersCountHistory[item];
        let isoDateString = rawDateStringToIsoString(item);
        if (!isoDateString)
            return;

        let timeStamp = Date.parse(isoDateString) / 1000
        data[0].push(timeStamp);
        data[1].push(countData);

        let tweetsCount = user.TweetsCountHistory[item];
        data[2].push(tweetsCount);
    })

    let graphContainer = document.getElementById('graph');
    if (graphContainer) {
        graphContainer.remove();
        graphContainer = undefined;
    }

    graphContainer = document.createElement('div');
    graphContainer.classList.add('overlay');
    graphContainer.style.display = "block";

    graphContainer.onclick = () => {
        graphContainer.remove();
        graphContainer = undefined;
        document.documentElement.style.overflow = 'scroll';
        document.body.scroll = "yes";
    }

    document.body.appendChild(graphContainer);
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";

    let width = parseInt(document.body.clientWidth * 0.8);
    let height = parseInt(document.body.clientHeight * 0.8);

    const opts = {
        width: width,
        height: height,
        title: "Followers & tweets count: " + userid,
        scales: {
            x: {
                time: false,
            },
        },
        series: [
            {
                value: (self, rawValue) => new Date(rawValue * 1000).toISOString().slice(0, 10)
            },
            {
                label: "Followers count",
                stroke: "red",
                scale: "c1",
                fill: "rgba(255,0,0,0.1)",
            },
            {
                label: "Tweets count",
                stroke: "blue",
                scale: "c2",
                // fill: "rgba(0,0,255,0.1)",
            },
        ],
        axes: [
            {
                values: (self, ticks, space) => {
                    //console.log(ticks);
                    return ticks.map(tick => '')//new Date(tick).toISOString().slice(0,10))
                }
            },
            {
                scale: "c1",
                grid: {show: false},
                values: (self, ticks) => ticks.map(rawValue => parseInt(rawValue))
            },
            {
                scale: "c2",
                side: 1,
                values: (self, ticks) => ticks.map(rawValue => parseInt(rawValue))
            }
        ],
        // scales: {
        //     "c2": {
        //         auto: false,
        //         range: [tCountMin, tCountMax],
        //     }
        // }
    };

    let u = new uPlot(opts, data, graphContainer);
}