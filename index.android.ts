
import * as utils from "tns-core-modules/utils/utils";
import { MapView, Marker, Position } from "nativescript-google-maps-sdk"

declare var com: any;

const LatLng = com.google.android.gms.maps.model.LatLng;
const PolylineOptions = com.google.android.gms.maps.model.PolylineOptions;
const LatLngBounds = com.google.android.gms.maps.model.LatLngBounds;
const CameraUpdateFactory = com.google.android.gms.maps.CameraUpdateFactory;

const ClusterItem = com.google.maps.android.clustering.ClusterItem;
const ClusterManager = com.google.maps.android.clustering.ClusterManager;
const DefaultClusterRenderer = com.google.maps.android.clustering.view.DefaultClusterRenderer;

const HeatmapTileProvider = com.google.maps.android.heatmaps.HeatmapTileProvider;

const TileOverlayOptions = com.google.android.gms.maps.model.TileOverlayOptions;

const debugNull = function (...args: Array<any>): void { };

function debugDefault(...args: Array<any>) {
  args = args.map((value) => {
    if (typeof value === 'object' && value) {
      try {
        value = JSON.stringify(value);
      } catch (e) {
        value = value.toString();
      }
    }
    return value;
  });
  args.unshift('nativescript-socket.io');
  console.log.apply(console, args);
}

let debug = debugNull;

export function enableDebug(debugFn: ((...args: Array<any>) => any) = debugDefault): void {
  debug = debugFn;
}

export function disableDebug(): void {
  debug = debugNull;
}

const CustomClusterItem = ClusterItem.extend({
  marker: null,
  init: function () { },
  getMarker: function () {
      return this.marker;
  },
  getPosition: function () {
      return this.marker.position.android;
  },
  getTitle: function () {
      return this.marker.title;
  },
  getSnippet: function () {
      return this.marker.snippet;
  },
});

const CustomClusterManager = ClusterManager.extend({
  mapView: null, // will be attached manually later
  customCallback: null, // will be attached manually later
  onCameraIdle() {
    this.super.onCameraIdle();
    if (this.customCallback) {
      this.customCallback();
    }
  },
  onMarkerClick(gmsMarker) {
    this.super.onMarkerClick(gmsMarker);
    let marker = this.mapView.findMarker((marker) => {
      if (marker.android.getId) {
        return marker.android.getId() === gmsMarker.getId();
      }
      return marker.title === gmsMarker.getTitle() && marker.snippet === gmsMarker.getSnippet() && marker.position.android.equals(gmsMarker.getPosition());
    });
    marker && this.mapView.notifyMarkerTapped(marker);
    return false;
  },
  onInfoWindowClick(gmsMarker) {
    this.super.onInfoWindowClick(gmsMarker);
    let marker = this.mapView.findMarker((marker) => {
      if (marker.android.getId) {
        return marker.android.getId() === gmsMarker.getId();
      }
      return marker.title === gmsMarker.getTitle() && marker.snippet === gmsMarker.getSnippet() && marker.position.android.equals(gmsMarker.getPosition());
    });
    marker && this.mapView.notifyMarkerInfoWindowTapped(marker);
    return false;
  },
});

let clusterManager;

export function setupMarkerCluster(mapView: MapView, markers: Array<Marker>, options) {
  debug('setupMarkerCluster');

  clusterManager = new CustomClusterManager(utils.ad.getApplicationContext(), mapView.gMap);

  clusterManager.mapView = mapView;

  if (options.customCallback) {
    clusterManager.customCallback = options.customCallback;
  }

  if (mapView.gMap.setOnCameraIdleListener) {
    mapView.gMap.setOnCameraIdleListener(clusterManager);
  } else if (mapView.gMap.setOnCameraChangeListener) {
    mapView.gMap.setOnCameraChangeListener(clusterManager);
  }

  mapView.gMap.setOnMarkerClickListener(clusterManager);
  mapView.gMap.setOnInfoWindowClickListener(clusterManager);

  markers.forEach(function (marker) {
    let markerItem = new CustomClusterItem();
    markerItem.marker = marker;
    clusterManager.addItem(markerItem);
    (mapView as any)._markers.push(marker);
  });

  clusterManager.cluster();
}

export function addMarkers(mapView: MapView, markers: Array<Marker>) {
  markers.forEach(function (marker) {
    let markerItem = new CustomClusterItem();
    markerItem.marker = marker;
    clusterManager.addItem(markerItem);
    (mapView as any)._markers.push(marker);
  });

  clusterManager.cluster();
}

export function removeMarkers(mapView: MapView) {
  // mapView.removeMarker((mapView as any)._markers);
  
  clusterManager.clearItems();

  clusterManager.cluster();
}

export interface IHeatmapConfig {

  provider: any,
  overlay: any,

}

export function setupHeatmap(mapView: MapView, positions: Array<Position>, config: IHeatmapConfig = null): IHeatmapConfig {
  debug('setupHeatmap');

  var list = new java.util.ArrayList();

  positions.forEach(function (position) {
    list.add(position.android);
  });

  if (config) {

    config.overlay.clearTileCache();
    config.provider.setData(list);

  } else {

    config = <IHeatmapConfig>{};

    config.provider = new HeatmapTileProvider.Builder()
      .data(list)
      .build();

    config.overlay = mapView.gMap.addTileOverlay(new TileOverlayOptions().tileProvider(config.provider));

  }

  return config;
}
