function showGraph(userid) {
    let user = getParameterCaseInsensitive(usersData.Users, userid);

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") { console.log('showGraph ym - local host; do nothing');  } 
    else {
        if(ym){
            try {
                ym(70569073,'reachGoal','showGraphCall')
            }
            catch(exception) {
                console.log(exception);
            }
        }
    }
    
    

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

    let title = "Followers & tweets count: " + userid;
    if(data[0].length < 2) {
        title = 'Dynamics will be available after two days of work'
    }

    let weeklyTrendLine = undefined;
    if(user.FollowersTrend && user.FollowersTrend.WeeklyTrendLine){
        weeklyTrendLine = user.FollowersTrend.WeeklyTrendLine
    }

    const opts = {
        width: width,
        height: height,
        title,
        scales: {
            x: {
                time: false,
            },
        },
        hooks: !weeklyTrendLine? undefined : {
            drawSeries: [
                (u, si) => {
                    if(si != 1)
                        return;

                    let ctx = u.ctx;

                    let s  = u.series[si];
                    let xd = u.data[0];
                    let yd = u.data[si];

                    let start = user.FollowersTrend.WeeklyTrendLine.Start;
                    let end = user.FollowersTrend.WeeklyTrendLine.End;
                    let isoDateStringStartX = rawDateStringToIsoString(start.X.toString());
                    if(!isoDateStringStartX)
                        return;
                    
                    let dateStartX = Date.parse(isoDateStringStartX) / 1000

                    let isoDateStringEndX = rawDateStringToIsoString(end.X.toString());
                    if(!isoDateStringEndX)
                        return;
                    
                    let dateEndX = Date.parse(isoDateStringEndX) / 1000


                    //let [i0, i1] = s.idxs;

                    let x0 = u.valToPos(dateStartX, 'x', true);//u.valToPos(xd[i0], 'x', true);
                    let y0 = u.valToPos(start.Y, 'c1', true);//u.valToPos(yd[i0], 'c1', true);
                    let x1 = u.valToPos(dateEndX, 'x', true);//u.valToPos(xd[i1], 'x', true);
                    let y1 = u.valToPos(end.Y, 'c1', true);//u.valToPos(yd[i1], 'c1', true);

                    const offset = (s.width % 2) / 2;

                    ctx.translate(offset, offset);

                    ctx.beginPath();
                    ctx.setLineDash([5, 5]);
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();

                    ctx.translate(-offset, -offset);
                }
            ]
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