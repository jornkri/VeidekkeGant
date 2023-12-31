
import { Gantt } from './gantt.module.js';
import { DateHelper, Model, Combo, SchedulerPro, StringHelper, EditorTab, Toast, EventModel, DatePicker, Splitter, Panel } from './schedulerpro.module.js';
import {resources, events, assignments} from './schedulerEventData.js';



    
// Ensure that the Tooltip shows nested events them in temporal order
const byStartDate = (leftSubEvent, rightSubEvent) => leftSubEvent.startDate - rightSubEvent.startDate;

// SchedulerPro subclass using nested events
class SchedulerWithSubtasks extends SchedulerPro {

    static $name  = 'SchedulerWithSubtasks';

    static type =  'schedulerwithsubtasks';

    static configurable = {
        features : {
            taskEdit : {
                editorConfig : {
                    width : '50em'
                },
                items : {
                    subTaskTab : {
                        type   : 'subtasktab',
                        weight : 110
                    }
                }
            },

            eventTooltip : {
                // Custom tooltip template, to display info on nested events when hovering a parent
                template : data => `
                    ${data.eventRecord.name ? `<div class="b-sch-event-title">${StringHelper.encodeHtml(data.eventRecord.name)}</div>` : ''}
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                    ${data.eventRecord.children ? '</br>' + data.eventRecord.children.slice().sort(byStartDate).map(r => `
                    <h4 class="b-tooltip-subevent-title">${StringHelper.encodeHtml(r.name)}</h4>
                    ${DateHelper.format(r.startDate, 'LT')} - ${DateHelper.format(r.endDate, 'LT')}
                `).join('') : ''}
                `
            },

            nestedEvents : {
                // Don't allow dragging nested events out of their parents
                constrainDragToParent : true
            },

            dependencies : false
        },

        // Disable initial animations, for less flickering when recreating the scheduler when toggling between modes
        useInitialAnimation : false,

        listeners : {
            // Only use the Subtask tab for parent events
            beforeTaskEditShow({ taskRecord, editor }) {
                editor.widgetMap.subTaskTab.disabled = !taskRecord.isParent;
            }
        }
    };
}

// Register this widget type with its Factory
SchedulerWithSubtasks.initClass();

/**
 * Extra Tab for TaskEditor to manage subtasks
 *
 * @extends SchedulerPro/widget/taskeditor/EditorTab
 */
class SubtaskTab extends EditorTab {

    static get $name() {
        return 'SubtaskTab';
    }

    static get type() {
        return 'subtasktab';
    }

    static get defaultConfig() {
        return {
            title            : 'Subtasks',
            cls              : 'b-tab-subtasks',
            autoUpdateRecord : false,
            layoutStyle      : {
                flexFlow : 'column nowrap'
            },
            items : {
                subEvents : {
                    type  : 'grid',
                    name  : 'subEvents',
                    flex  : '1 1 auto',
                    width : '100%',
                    store : {
                        sorters    : [{ field : 'startDate', ascending : true }],
                        modelClass : EventModel
                    },
                    columns : [
                        { field : 'name', text : 'Name', flex : 1 },
                        {
                            field  : 'startDate',
                            text   : 'Start date',
                            flex   : 1,
                            type   : 'date',
                            format : 'YYYY-MM-DD hh:mm A',
                            editor : {
                                type      : 'datetimefield',
                                timeField : {
                                    stepTriggers : false
                                },
                                dateField : {
                                    stepTriggers : false
                                }
                            }
                        },
                        {
                            field  : 'endDate',
                            text   : 'End date',
                            flex   : 1,
                            type   : 'date',
                            format : 'YYYY-MM-DD hh:mm A',
                            editor : {
                                type      : 'datetimefield',
                                timeField : {
                                    stepTriggers : false
                                },
                                dateField : {
                                    stepTriggers : false
                                }
                            }
                        }
                    ]
                },
                toolbar : {
                    type       : 'toolbar',
                    flex       : '0 0 auto',
                    cls        : 'b-compact-bbar',
                    namedItems : {
                        add : {
                            type    : 'button',
                            cls     : 'b-add-button b-green',
                            icon    : 'b-icon b-icon-add',
                            tooltip : 'Add new subtask',
                            onClick : 'up.onAddClick'
                        },
                        remove : {
                            type    : 'button',
                            cls     : 'b-remove-button b-red',
                            icon    : 'b-icon b-icon-trash',
                            tooltip : 'Delete selected subtask',
                            onClick : 'up.onDeleteClick'
                        }
                    },
                    items : {
                        add    : true,
                        remove : true
                    }
                }
            }
        };
    }

    construct() {
        super.construct(...arguments);

        this.grid = this.widgetMap.subEvents;

        this.grid.store.on({
            change  : 'onStoreChange',
            thisObj : this
        });
    }

    // go through all sub events and try to find the first available space that may be used to add a new sub event
    findEarliestUnallocatedTimeSlot(parentEvent) {
        const
            subEvents               = parentEvent.children.slice(),
            { endDate : parentEnd } = parentEvent;

        let { startDate } = parentEvent,
            // use 1 hour duration by default
            endDate       = DateHelper.add(startDate, 1, 'hour');

        // subEvents should be sorted by startDate to make sure we will not skip any free space
        subEvents.sort((r1, r2) => r1.startDate - r2.startDate);

        for (const nestedEvent of subEvents) {
            const
                nestedStartDate = nestedEvent.startDate,
                nestedEndDate   = nestedEvent.endDate;

            // if intercepting with startDate, use endDate of nested event
            if (nestedStartDate.getTime() === startDate.getTime() ||
                nestedStartDate < startDate &&
                nestedEndDate > startDate
            ) {
                startDate = nestedEndDate;
                endDate   = DateHelper.add(startDate, 1, 'hour');
            }
            else if (nestedStartDate < endDate) {
                endDate = nestedStartDate;
            }
            else if (parentEnd < endDate) {
                endDate = parentEnd;
            }
            if (startDate >= parentEnd) {
                startDate = endDate = parentEnd;
            }
            else if (endDate >= parentEnd) {
                endDate = parentEnd;
            }
        }

        // no free space found
        if (startDate.getTime() === endDate.getTime()) {
            return null;
        }

        return { startDate, endDate };
    }

    // Make changes in the grid reflect on the parent event being edited.
    // Editing fields reflect automatically since child events are edited directly, but add / remove must be handled.
    onStoreChange({ action, records }) {
        const { record } = this;

        if (action === 'remove') {
            record.removeChild(records);
        }
        else if (action === 'add') {
            record.appendChild(records);
        }
    }

    onAddClick() {
        const timeSlot = this.findEarliestUnallocatedTimeSlot(this.record);

        if (!timeSlot) {
            Toast.show('No unallocated time slot could be found in the main event');
            return;
        }

        const
            { startDate, endDate } = timeSlot,
            [added]              = this.grid.store.add({
                name : 'New subtask',
                startDate,
                endDate
            });

        // Assign the new event to the same resource as its parent, otherwise it won't show up
        added.assign(this.record.resource);

        this.grid.startEditing(added);
    }

    onDeleteClick() {
        const
            { grid }       = this,
            selectedRecord = grid.selectedRecord;

        grid.features.cellEdit.cancelEditing(true);
        selectedRecord && grid.store.remove(selectedRecord);
    }

    set record(record) {
        super.record = record;

        if (record) {
            this.grid.store.loadData(record.children || []);
        }
        else {
            // make sure cellEditor is hidden to prevent show it up on taskEdit reopen
            this.grid.features.cellEdit.finishEditing();
        }
    }

    get record() {
        return super.record;
    }
}

// Register this widget type with its Factory
SubtaskTab.initClass();
class MapPanel extends Panel {
    // Factoryable type name
    static get type() {
        return 'mappanel';
    };
};

let scheduler;

// Cannot toggle mode between horizontal and vertical at runtime, so need to destroy and recreate the scheduler
function createScheduler(mode) {
    const isHorizontal = mode === 'horizontal';

    scheduler?.destroy?.();

    // Create a new scheduler from the custom subclass, see SchedulerWithSubtasks
    scheduler = new SchedulerWithSubtasks({
        appendTo          : 'container',
        resourceImagePath : '../icons/',
        startDate         : new Date(2023, 9, 29, 7),
        endDate           : new Date(2023, 11, 29, 21),
        viewPreset        : 'hourAndDay',
        rowHeight         : 90,
        barMargin         : 10,
        // Columns are only applicable in horizontal mode
        columns           : isHorizontal ? [
            { type : 'resourceInfo', text : 'Aktivitet', field : 'name', width : 130 },
            { type : 'rating', text : 'Fremdrift', field : 'rating' }
        ] : [],
        project : {           
            // autoLoad : true,
            // success : true,
            resourcesData : resources.resources,
            eventsData: events.eventData,
            assignmentsData: assignments.assignmentsData    
        
        },
        listeners : {
            eventClick : ({ eventRecord }) => {
                // When an event bar is clicked, bring the marker into view and show a tooltip
                if (eventRecord.marker) {
                    mapPanel?.showTooltip(eventRecord, true);
                }
            },

            afterEventSave : ({ eventRecord }) => {
                if (eventRecord.marker) {
                    mapPanel?.scrollMarkerIntoView(eventRecord);
                }
            }
        },
        mode,
        tbar : [
            
            {
                type        : 'buttongroup',
                toggleGroup : true,
                items       : {
                    horizontal : { text : 'Horizontal mode', icon : 'b-fa-left-right', pressed : isHorizontal },
                    vertical   : { text : 'Vertical mode', icon : 'b-fa-up-down', pressed : !isHorizontal },
                },
                onToggle({ pressed, source }) {
                    if (pressed) {
                        createScheduler(source.ref);
                    }
                }
            }, 
            {
                type     : 'datefield',
                ref      : 'dateField',
                width    : 190,
                editable : false,
                step     : 1,
                onChange : 'up.onDateFieldChange'
            },
                
        ],
        
        onDateFieldChange({ value, userAction }) {
            userAction && this.setTimeSpan(DateHelper.add(value, 8, 'hour'), DateHelper.add(value, 20, 'hour'));
        }
    });

    new Splitter({
        appendTo : 'container'
    });
    
    
    
    
}


let mapPanel;

mapPanel = new MapPanel({
    ref        : 'map',
    appendTo   : 'mapView',
    flex       : 2,
    // eventStore : scheduler.eventStore,
    // timeAxis   : scheduler.timeAxis,
    listeners  : {
        // When a map marker is clicked, scroll the event bar into view and highlight it
        markerclick : async({ eventRecord }) => {
            await scheduler.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
            scheduler.selectedEvents = [eventRecord];
        }
    }
});

createScheduler('horizontal');
