async function getBolts(url="https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: "aktivitet = '1 Bolter'",
        outFields: "fra_tidspunkt, til_tidspunkt, aktivitet, antall, OBJECTID",
        f: "json"
    });

    const response = await fetch(`${url}?${params}`, {
        method: "GET",
        mode: "cors",
        headers:{
            "Content-Type": "application/json"
        },

    })

    return response.json();
}

const feats = await getBolts();
const kids = feats.features.map(ft => ({id: ft.attributes.OBJECTID, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))

const start_timestamps = feats.features.map(ft => ft.attributes.fra_tidspunkt)
const end_timestamps = feats.features.map(ft => ft.attributes.til_tidspunkt)

console.log(Math.max(...start_timestamps))
//console.log(end_timestamps)

//console.log(kids)