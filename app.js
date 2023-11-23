
import { Gantt } from './gantt.module.js';

//const gantt = new Gantt({/*...*/ });

async function getBolts(url="https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: data.where, //"aktivitet = '1 Bolter'",
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

const sBetongData = await getActivity("https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", {where: "aktivitet = '1 Sprøytebetong'"});
const sBetongKids = sBetongData.features.map(ft => ({id: ft.attributes.OBJECTID, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))

const bolt1Data = await getActivity("https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", {where: "aktivitet = '1 Bolter'"});
const bolt1Kids = bolt1Data.features.map(ft => ({id: ft.attributes.OBJECTID, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))


const gantt = new Gantt({
    appendTo : document.body,

    startDate : new Date(2022, 8, 24),
    endDate   : Date.now(),

    project : {

        tasksData : [
            {
                id       : 1,
                name     : 'Sprøytebetong',
                expanded : false,
                children : sBetongKids
            }
        ],
        tasksData : [
            {
                id       : 2,
                name     : '1 Bolter',
                expanded : false,
                children : bolt1Kids
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