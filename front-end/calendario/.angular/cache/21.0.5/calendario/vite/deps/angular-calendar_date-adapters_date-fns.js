import {
  __commonJS,
  __toESM
} from "./chunk-46DXP6YY.js";

// optional-peer-dep:__vite-optional-peer-dep:date-fns:calendar-utils:false
var require_vite_optional_peer_dep_date_fns_calendar_utils_false = __commonJS({
  "optional-peer-dep:__vite-optional-peer-dep:date-fns:calendar-utils:false"(exports, module) {
    module.exports = {};
    throw new Error(`Could not resolve "date-fns" imported by "calendar-utils". Is it installed?`);
  }
});

// optional-peer-dep:__vite-optional-peer-dep:date-fns:angular-calendar:false
var require_vite_optional_peer_dep_date_fns_angular_calendar_false = __commonJS({
  "optional-peer-dep:__vite-optional-peer-dep:date-fns:angular-calendar:false"(exports, module) {
    module.exports = {};
    throw new Error(`Could not resolve "date-fns" imported by "angular-calendar". Is it installed?`);
  }
});

// node_modules/calendar-utils/date-adapters/esm/date-fns/index.js
var import_date_fns = __toESM(require_vite_optional_peer_dep_date_fns_calendar_utils_false());
function getTimezoneOffset(date) {
  return new Date(date).getTimezoneOffset();
}
function adapterFactory() {
  return {
    addDays: import_date_fns.addDays,
    addHours: import_date_fns.addHours,
    addMinutes: import_date_fns.addMinutes,
    addSeconds: import_date_fns.addSeconds,
    differenceInDays: import_date_fns.differenceInDays,
    differenceInMinutes: import_date_fns.differenceInMinutes,
    differenceInSeconds: import_date_fns.differenceInSeconds,
    endOfDay: import_date_fns.endOfDay,
    endOfMonth: import_date_fns.endOfMonth,
    endOfWeek: import_date_fns.endOfWeek,
    getDay: import_date_fns.getDay,
    getMonth: import_date_fns.getMonth,
    isSameDay: import_date_fns.isSameDay,
    isSameMonth: import_date_fns.isSameMonth,
    isSameSecond: import_date_fns.isSameSecond,
    max: import_date_fns.max,
    setHours: import_date_fns.setHours,
    setMinutes: import_date_fns.setMinutes,
    startOfDay: import_date_fns.startOfDay,
    startOfMinute: import_date_fns.startOfMinute,
    startOfMonth: import_date_fns.startOfMonth,
    startOfWeek: import_date_fns.startOfWeek,
    getHours: import_date_fns.getHours,
    getMinutes: import_date_fns.getMinutes,
    getTimezoneOffset
  };
}

// node_modules/angular-calendar/date-adapters/esm/date-fns/index.js
var import_date_fns3 = __toESM(require_vite_optional_peer_dep_date_fns_angular_calendar_false());
function adapterFactory2() {
  return Object.assign(Object.assign({}, adapterFactory()), {
    addWeeks: import_date_fns3.addWeeks,
    addMonths: import_date_fns3.addMonths,
    subDays: import_date_fns3.subDays,
    subWeeks: import_date_fns3.subWeeks,
    subMonths: import_date_fns3.subMonths,
    getISOWeek: import_date_fns3.getISOWeek,
    setDate: import_date_fns3.setDate,
    setMonth: import_date_fns3.setMonth,
    setYear: import_date_fns3.setYear,
    getDate: import_date_fns3.getDate,
    getYear: import_date_fns3.getYear
  });
}
export {
  adapterFactory2 as adapterFactory
};
//# sourceMappingURL=angular-calendar_date-adapters_date-fns.js.map
