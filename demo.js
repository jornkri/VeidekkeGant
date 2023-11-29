
import { SchedulerPro } from './gantt.module.js';
const schedulerPro = new SchedulerPro({
    appendTo : document.body,

    // makes scheduler as high as it needs to be to fit rows
    //autoHeight : true,

    startDate : new Date(2022, 2, 20),
    endDate   : new Date(2022, 2, 27),

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    project : {
        resourcesData : [
            { id : 1, name : 'Bruce' },
            { id : 2, name : 'Diana' }
        ],

        eventsData : [
            {
                id        : 1,
                name      : 'Art project',
                startDate : '2022-03-21',
                segments  : [
                    { startDate : '2022-03-23', duration : 1 },
                    { startDate : '2022-03-21', endDate: '2022-03-22',  },
                    { startDate : '2022-03-25', duration : 1 }
                ]
            },
            {
                id        : 2,
                name      : 'DIY project',
                startDate : '2022-03-21',
                segments  : [
                    // segments can have their own names & colors
                    { name : 'Plan', startDate : '2022-03-21', duration : 1, eventColor : 'indigo' },
                    { name : 'Get supplies', startDate : '2022-03-23', duration : 2  }
                ]
            }
        ],

        assignmentsData : [
            { id : 1, event : 1, resource : 1 },
            { id : 2, event : 2, resource : 2 }
        ]
    }
});
