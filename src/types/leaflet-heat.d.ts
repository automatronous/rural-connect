import 'leaflet';

declare module 'leaflet' {
  interface HeatLayerOptions extends LayerOptions {
    blur?: number;
    gradient?: Record<number, string>;
    max?: number;
    maxZoom?: number;
    minOpacity?: number;
    radius?: number;
  }

  interface HeatLayer extends Layer {
    addLatLng(latlng: [number, number, number?]): this;
    redraw(): this;
    setLatLngs(latlngs: Array<[number, number, number?]>): this;
    setOptions(options: HeatLayerOptions): this;
  }

  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions,
  ): HeatLayer;
}
