
import { Gantt } from './gantt.module.js';

//const gantt = new Gantt({/*...*/ });

// async function getActivity(url="https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", data={}){
//     const params = new URLSearchParams({
//         returnGeometry: "false",
//         where: data.where,//"aktivitet = '1 Bolter'",
//         outFields: "fra_tidspunkt, til_tidspunkt, aktivitet, antall, aktivet_label, OBJECTID" ,
//         f: "json"
//     });

//     const response = await fetch(`${url}?${params}`, {
//         method: "GET"
//     })

//     return response.json();
// }


// const sBetongData = await getActivity("https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", {where: "aktivitet = '1 Sprøytebetong' AND fra_tidspunkt < til_tidspunkt"});
// const sBetongKids = sBetongData.features.map(ft => ({id: ft.attributes.OBJECTID, name:ft.attributes.aktivet_label, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))

// const bolt1Data = await getActivity("https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0/query", {where: "aktivitet = '1 Bolter' AND fra_tidspunkt < til_tidspunkt"});
// const bolt1Kids = bolt1Data.features.map(ft => ({id: ft.attributes.OBJECTID+1, name:ft.attributes.aktivet_label, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt)}))


async function getActivity(url="https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: data.where,//"aktivitet = '1 Bolter'",
        outFields: "fra_tidspunkt, til_tidspunkt, aktivitet, antall, aktivet_label, OBJECTID_1" ,
        f: "json"
    });

    const response = await fetch(`${url}?${params}`, {
        method: "GET"
    })

    return response.json();
}


const sBetongData = await getActivity("https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", {where: "aktivitet = 'Sprøytebetong' AND fra_tidspunkt < til_tidspunkt"});
const sBetongKids = sBetongData.features.map(ft => ({id: ft.attributes.OBJECTID_1, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt), manuallyScheduled: true}))

const bolt1Data = await getActivity("https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", {where: "aktivitet = 'Bolt' AND fra_tidspunkt < til_tidspunkt"});
const bolt1Kids = bolt1Data.features.map(ft => ({id: ft.attributes.OBJECTID_1, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt), manuallyScheduled: true}))


console.log(bolt1Kids)
console.log(sBetongKids)
const gantt = new Gantt({
    appendTo : document.body,

    startDate : new Date(2023, 10, 1),
    endDate   : Date.now(),
    project : {

        tasksData : [
            {
                id       : 'yoyo',
                name     : 'Sprøytebetong',
                expanded : true,
                children : sBetongKids
            },
            {
                id       : 'hei',
                name     : '1 Bolter',
                expanded : true,
                children : bolt1Kids
            }
        ],

    

    columns : [
        { type : 'name', width : 160 }
    ]
}});