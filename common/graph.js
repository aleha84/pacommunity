function showGraph() {
    let userid = this.parentElement.getAttribute('userid');
    let user = usersData.Users[userid];
    console.log(user)
    if (!user) {
        console.log('No user found: ' + userid);
        return;
    }

    let data = [[], []];
    Object.keys(user.FollowersCountHistory).forEach(item => {
        let countData = user.FollowersCountHistory[item];
        let isoDateString = rawDateStringToIsoString(item);
        if (!isoDateString)
            return;

        let timeStamp = Date.parse(isoDateString) / 1000
        data[0].push(timeStamp);
        data[1].push(countData);
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
        title: "Followers",
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
                fill: "rgba(255,0,0,0.1)",
            },
        ],
        axes: [
            {
                values: (self, ticks, space) => {
                    //console.log(ticks);
                    return ticks.map(tick => '')//new Date(tick).toISOString().slice(0,10))
                }
            }
        ]
    };

    let u = new uPlot(opts, data, graphContainer);
}