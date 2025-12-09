let hourFilter = ['>=', ['number', ['get', 'Hour']], 0];
let dayFilter  = ['>=', ['number', ['get', 'Day']], 0];

function updateFilters() {
    map.setFilter('collisions-layer', ['all', hourFilter, dayFilter]);
}

mapboxgl.accessToken = 'pk.eyJ1Ijoia2VpdGgxMjN1dyIsImEiOiJjbWl1aTVxanExcXZoM29wdWhwazh6eTh4In0.nZSVh_Rfj0JNqQyc0usoXQ';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    zoom: 14,
    center: [-122.3090, 47.652]
});

map.on('load', async () => {
    const response = await fetch('assets/SDOT.geojson');
    const collisions = await response.json();

    collisions.features.forEach(f => {
        const dt = new Date(f.properties.INCDTTM);
        f.properties.Hour = dt.getHours();
        f.properties.Day = dt.getDay();
    });

    map.addSource('collisions', {
        type: 'geojson',
        data: collisions
    });

    map.addLayer({
        id: 'collisions-layer',
        type: 'circle',
        source: 'collisions',
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                [
                    '+',
                    ['number', ['get', 'INJURIES'], 0],
                    ['number', ['get', 'FATALITIES'], 0]
                ],
                0, 3,
                1, 6,
                2, 9,
                3, 12,
                4, 16,
                5, 20
                ],

                'circle-color': [
                'interpolate',
                ['linear'],
                [
                    '+',
                    ['number', ['get', 'INJURIES'], 0],
                    ['number', ['get', 'FATALITIES'], 0]
                ],
                0, '#9ECAE1',
                1, '#FEE08B',
                2, '#FDAE61',
                3, '#F46D43',
                4, '#D73027',
                6, '#7F0000'
                ],

            'circle-opacity': 0.8
        }
    });

    const slider    = document.getElementById('slider');
    const hourLabel = document.getElementById('active-hour');

    const initialHour = Number(slider.value);  // Default 12
    hourFilter = ['==', ['number', ['get', 'Hour']], initialHour];
    updateFilters();

    const initAmpm  = initialHour >= 12 ? 'PM' : 'AM';
    const initHour12 = initialHour % 12 || 12;
    hourLabel.innerText = initHour12 + initAmpm;

    slider.addEventListener('input', (event) => {
        const hour = parseInt(event.target.value);

        hourFilter = ['==', ['number', ['get', 'Hour']], hour];
        updateFilters();

        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 ? hour % 12 : 12;

        document.getElementById('active-hour').innerText = hour12 + ampm;
    });

    document.getElementById('filters').addEventListener('change', (event) => {
        const day = event.target.value;

        if (day === 'all') {
            dayFilter = ['>=', ['number', ['get', 'Day']], 0];
        } else if (day === 'weekday') {
            dayFilter = [
                'match',
                ['get', 'Day'],
                1, true,
                2, true,
                3, true,
                4, true,
                5, true,
                false
            ];
        } else if (day === 'weekend') {
            dayFilter = [
                'match',
                ['get', 'Day'],
                0, true,
                6, true,
                false
            ];
        } else {
            console.log('error')
        }

        updateFilters();
    });
});

