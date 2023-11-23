
import { Gantt } from './gantt.module.js';

//const gantt = new Gantt({/*...*/ });

async function getBolts(url="https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: "aktivitet = '1 Bolter'",
        outFields: "fra_tidspunkt, til_tidspunkt, aktivitet, antall, OBJECTID",
        f: "json"
    });

    const response = await fetch(`${url}?${params}`, {
        method: "GET",
        // mode: "cors",
        // headers:{
        //     "Content-Type": "application/json"
        // },

    })

    return response.json();
}

const feats = await getBolts();
const kids = feats.features.map(ft => ({id: ft.attributes.OBJECTID, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))

const gantt = new Gantt({
    appendTo : document.body,

    startDate : new Date(2022, 0, 1),
    endDate   : Date.now(),

    project : {

        tasksData : [
            {
                id       : 1,
                name     : 'Bolter',
                expanded : true,
                children : kids
            }
        ],

        // dependenciesData : [
        //     { fromTask : 2, toTask : 3 }
        // ]
    },

    columns : [
        { type : 'name', width : 160 }
    ]
});