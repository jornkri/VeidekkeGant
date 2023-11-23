
import { Gantt } from './gantt.module.js';

//const gantt = new Gantt({/*...*/ });

async function getBolts(url="https://services-eu1.arcgis.com/eePcGuRGPyGzmI0A/arcgis/rest/services/Basrapport%20Aktivitet/FeatureServer/0", data={}){
    const params = new URLSearchParams({
        returnGeometry: "false",
        where: "aktivitet = '1 Bolter'",
        outFields: "fra_tidspunkt, til_tidspunkt, aktivitet"
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

console.log(getBolts())

const gantt = new Gantt({
    appendTo : document.body,

    startDate : new Date(2022, 0, 1),
    endDate   : new Date(2022, 0, 10),

    project : {

        tasksData : [
            {
                id       : 1,
                name     : 'Write docs',
                expanded : true,
                children : [
                    { id : 2, name : 'Proof-read docs', startDate : '2022-01-02', endDate : '2022-01-09' },
                    { id : 3, name : 'Release docs', startDate : '2022-01-09', endDate : '2022-01-10' }
                ]
            }
        ],

        dependenciesData : [
            { fromTask : 2, toTask : 3 }
        ]
    },

    columns : [
        { type : 'name', width : 160 }
    ]
});