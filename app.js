
import { Gantt } from './gantt.module.js';

//const gantt = new Gantt({/*...*/ });

async function getActivity(url="https://veidekke.cloudgis.no/enterprise/rest/services/Hosted/Basrapport/FeatureServer/0/query", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: data.where,//"aktivitet = '1 Bolter'",
        outFields: "fra_klokken, til_klokken, aktivitet, varighet , aktivet_label, objectid" ,
        f: "json"
    });

    const response = await fetch(`${url}?${params}`, {
        method: "GET"
    })

    return response.json();
}


const boltmonteringData = await getActivity("https://veidekke.cloudgis.no/enterprise/rest/services/Hosted/Basrapport/FeatureServer/0/query", {where: "aktivitiet = 'Boltemontering' AND fra_klokken < til_tidspunkt"});
const boltmonteringKids = boltmonteringData.features.map(ft => ({id: ft.attributes.objectid, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_klokken), endDate: new Date(ft.attributes.til_klokken), manuallyScheduled: true}))

const boringData = await getActivity("https://veidekke.cloudgis.no/enterprise/rest/services/Hosted/Basrapport/FeatureServer/0/query", {where: "aktivitiet = 'Boring' AND fra_tidspunkt < til_tidspunkt"});
const boringKids = boringData.features.map(ft => ({id: ft.attributes.objectid, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_klokken), endDate: new Date(ft.attributes.til_klokken), manuallyScheduled: true}))


// async function getActivity(url="https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", data={}){
//     const params = new URLSearchParams({
//         returnGeometry: "false",
//         where: data.where,//"aktivitet = '1 Bolter'",
//         outFields: "fra_tidspunkt, til_tidspunkt, aktivitet, antall, aktivet_label, OBJECTID_1" ,
//         f: "json"
//     });

//     const response = await fetch(`${url}?${params}`, {
//         method: "GET"
//     })

//     return response.json();
// }


// const sBetongData = await getActivity("https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", {where: "aktivitet = 'Sprøytebetong' AND fra_tidspunkt < til_tidspunkt"});
// const sBetongKids = sBetongData.features.map(ft => ({id: ft.attributes.OBJECTID_1, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt), manuallyScheduled: true}))

// const bolt1Data = await getActivity("https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/testdata_Gantdiagram/FeatureServer/0/query", {where: "aktivitet = 'Bolt' AND fra_tidspunkt < til_tidspunkt"});
// const bolt1Kids = bolt1Data.features.map(ft => ({id: ft.attributes.OBJECTID_1, name:ft.attributes.aktivitet, startDate: new Date(ft.attributes.fra_tidspunkt), endDate: new Date(ft.attributes.til_tidspunkt), manuallyScheduled: true, eventColor : 'violet'}))


console.log(boltmonteringKids)
console.log(boringKids)
const gantt = new Gantt({
    appendTo : document.body,

    startDate : new Date(2022, 10, 1),
    endDate   : Date.now(),
    project : {

        tasksData : [
            {
                id       : 'Sproytebetong',
                name     : 'Sprøytebetong',
                expanded : true,
                startDate: new Date(2022, 10, 1),
                segments   : boltmonteringKids
            },
            {
                id       : 'boring',
                name     : 'Boring',
                expanded : true,
                startDate: new Date(2022, 10, 1),
                segments : boringKids
            }
        ],

    

    columns : [
        { type : 'name', width : 160 }
    ]
}});