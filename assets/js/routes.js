function findRoutes() {

    document.getElementById("routeResults")
        .classList.remove("hidden");

    const routes = [
        {
            name: "Route A",
            risk: "safe",
            time: "24 min",
            distance: "12 km"
        },
        {
            name: "Route B",
            risk: "mild",
            time: "28 min",
            distance: "14 km"
        },
        {
            name: "Route C",
            risk: "heavy",
            time: "35 min",
            distance: "16 km"
        }
    ];

    const container =
        document.getElementById("routeCards");

    container.innerHTML = "";

    routes.forEach(route => {

        container.innerHTML += `
        <div class="route-card">
            <div class="rc-header">
                <div class="rc-name">${route.name}</div>
                <div class="rc-risk-badge ${route.risk}">
                    ${route.risk.toUpperCase()}
                </div>
            </div>

            <div class="rc-stats">
                <div class="rc-stat">
                    <div class="rc-stat-val">${route.time}</div>
                    <div class="rc-stat-lbl">Time</div>
                </div>

                <div class="rc-stat">
                    <div class="rc-stat-val">${route.distance}</div>
                    <div class="rc-stat-lbl">Distance</div>
                </div>

                <div class="rc-stat">
                    <div class="rc-stat-val">Low</div>
                    <div class="rc-stat-lbl">Flood</div>
                </div>
            </div>

            <div class="rc-btns">
                <button class="rc-btn-open">
                    Open Route
                </button>

                <button class="rc-btn-detail">
                    See Details
                </button>
            </div>
        </div>
        `;
    });
}
