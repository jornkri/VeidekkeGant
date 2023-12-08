async function getActivityFeatures(baseUrl, queryParams) {
  const searchParams = new URLSearchParams(queryParams);
  const urlWithParams = `${baseUrl}?${searchParams.toString()}`;
  const response = await fetch(urlWithParams);
  const data = await response.json();
  const features = data.features;

  return features;
}

async function getDistinctActivities(baseUrl) {
  const queryParams = {
    f: "json",
    returnDistinctValues: "true",
    where: "1=1",
    outFields: "aktivitiet", //skriveleif på tjenesten...
    returnGeometry: "false",
  };
  const searchParams = new URLSearchParams(queryParams);
  const urlWithParams = `${baseUrl}?${searchParams.toString()}`;
  const response = await fetch(urlWithParams);
  const data = await response.json();
  const activities = data.features.map((ft) => ft.attributes.aktivitiet);
  return activities;
}

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const string =
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2) +
    "T" +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2) +
    ":" +
    ("0" + date.getSeconds()).slice(-2);

  return string;
};

function makeEventsFromFeatures(features) {
  const startDate = formatDate(findEarliestDate(features));
  const endDate = formatDate(findLatestDate(features));
  const activityName = features[0].attributes.aktivitiet; // antar at vi har features
  const activityIndex = activities.indexOf(activityName) + 1;
  const activityId = activityIndex;
  const activitySegements = features.map((ft) => {
    try {
      const featureIndex = ft.attributes.objectid;
      const childIdString = activityId.toString() + featureIndex.toString();
      const fraDato = new Date(ft.attributes.fra_klokken);
      const tilDato = new Date(ft.attributes.til_klokken);
      return {
        startDate: formatDate(fraDato),
        endDate: formatDate(tilDato),
        name: ft.attributes.aktivitiet,
        id: parseInt(childIdString),
      };
    } catch (err) {
      console.error("Caught an error:", err.message);
    }
  });
  return {
    id: activityId,
    name: activityName,
    startDate: startDate,
    endDate: endDate,
    children: activitySegements,
  };
}

function findEarliestDate(features) {
  const fromTimestamps = features.map((ft) => ft.attributes.fra_klokken);
  const minTimestamp = Math.min(...fromTimestamps);
  const minDate = new Date(minTimestamp);
  try {
    return minDate.toISOString();
  } catch (err) {
    console.error("Caught an error"), err.message;
  }
}

function findLatestDate(features) {
  const fromTimestamps = features.map((ft) => ft.attributes.til_klokken);
  const minTimestamp = Math.max(...fromTimestamps);
  const minDate = new Date(minTimestamp);
  try {
    return minDate.toISOString();
  } catch (err) {
    console.error("Caught an error"), err.message;
  }
}

async function makeEventData(activities) {
  const eventData = [];
  for (const act of activities) {
    const act_feats = await getActivityFeatures(testUrl, {
      f: "json",
      returnGeometry: "false",
      outFields: "fra_klokken,til_klokken,aktivitiet,aktivitetsnummer,objectid",
      where: `aktivitiet = '${act}' AND fra_klokken > '1970-01-01T00:00:00.000Z'AND fra_klokken < til_klokken`,
    });
    if (act_feats.length > 0) {
      const event = makeEventsFromFeatures(act_feats);
      eventData.push(event);
    } else {
      console.log(act + " is empty!");
    }
  }
  return eventData;
}

const testUrl =
  "https://veidekke.cloudgis.no/enterprise/rest/services/Hosted/Basrapport/FeatureServer/0/query";
const testParams = {
  f: "json",
  returnGeometry: "false",
  where:
    "aktivitiet = 'Boring' AND fra_klokken > '1970-01-01T00:00:00.000Z' AND fra_klokken < til_klokken",
  outFields: "fra_klokken, til_klokken, aktivitiet, aktivitetsnummer", //pass deg for skriveleifen!
};

const activities = await getDistinctActivities(testUrl);

const resourcesData = activities.map((act) => {
  return { id: activities.indexOf(act) + 1, name: act };
});
const resources = {
  resources: resourcesData,
};

console.log("resources", resources);

const eventData = await makeEventData(activities);
const events = { eventData };
console.log("events:", events);

function makeAssignmentsFromEventData(eventData) {
  const rows = [];
  for (const evt of eventData) {
    const row = { event: evt.id, resource: evt.id };
    rows.push(row);
    for (const child of evt.children) {
      const childRow = { event: child.id, resource: evt.id };
      rows.push(childRow);
    }
  }
  for (const assn of rows) {
    assn.id = rows.indexOf(assn) + 1;
  }
  return rows;
}

const assignmentsData = await makeAssignmentsFromEventData(eventData);

const assignments = {
  assignmentsData,
};

export async function fetchData() {
  const activities = await getDistinctActivities(testUrl);

  const resourcesData = activities.map((act) => {
    return { id: activities.indexOf(act) + 1, name: act };
  });
  const resources = {
    resources: resourcesData,
  };
  return resources;
}

console.log("assignments:", assignments);

export { resources, events, assignments };
