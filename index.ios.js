"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugNull = function (...args) { };
function debugDefault(...args) {
    args = args.map((value) => {
        if (typeof value === 'object' && value) {
            try {
                value = JSON.stringify(value);
            }
            catch (e) {
                value = value.toString();
            }
        }
        return value;
    });
    args.unshift('nativescript-socket.io');
    console.log.apply(console, args);
}
let debug = debugNull;
function enableDebug(debugFn = debugDefault) {
    debug = debugFn;
}
exports.enableDebug = enableDebug;
function disableDebug() {
    debug = debugNull;
}
exports.disableDebug = disableDebug;
function setupMarkerCluster(mapView, markers, options) {
    debug('setupMarkerCluster');
    console.log("*** init ios map view: ");
    const clusterManager = GMUClusterManager.alloc();
    console.log("*** map view: ", clusterManager);
}
exports.setupMarkerCluster = setupMarkerCluster;
function setupHeatmap(mapView, positions, config = null) {
    debug('setupHeatmap');
    return config;
}
exports.setupHeatmap = setupHeatmap;
//# sourceMappingURL=index.ios.js.map