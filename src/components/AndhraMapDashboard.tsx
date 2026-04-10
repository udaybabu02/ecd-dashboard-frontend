import { useMemo, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Info } from "lucide-react";

interface GeoFeature {
  type: string;
  properties: { district: string };
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
}

interface GeoJSON {
  type: string;
  features: GeoFeature[];
}

// District name mapping: GeoJSON name → dataset name (for districts that differ)
const GEOJSON_TO_DATASET: Record<string, string> = {
  "Sri Potti Sriramulu Nellore": "Nellore",
  "Anantapuramu": "Anantapur",
  "YSR": "Kadapa",
};

const datasetName = (geoName: string) => GEOJSON_TO_DATASET[geoName] || geoName;

function getSeverityColor(pct: number): string {
  if (pct <= 20) return "hsl(142, 71%, 45%)";
  if (pct <= 40) return "hsl(48, 96%, 53%)";
  if (pct <= 60) return "hsl(25, 95%, 53%)";
  return "hsl(0, 84%, 60%)";
}

// Simple Mercator projection
function projectPoint(lon: number, lat: number, bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }, width: number, height: number): [number, number] {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
  const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
  return [x, y];
}

function coordsToPath(coords: number[][], bounds: any, w: number, h: number): string {
  return coords.map((pt, i) => {
    const [x, y] = projectPoint(pt[0], pt[1], bounds, w, h);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function getCentroid(coords: number[][]): [number, number] {
  let sumX = 0, sumY = 0;
  const n = coords.length;
  for (const pt of coords) { sumX += pt[0]; sumY += pt[1]; }
  return [sumX / n, sumY / n];
}

// District capital approximate coordinates
const DISTRICT_HQS: Record<string, [number, number]> = {
  "Srikakulam": [84.0, 18.3],
  "Vizianagaram": [83.4, 18.1],
  "Parvathipuram Manyam": [83.4, 18.8],
  "Visakhapatnam": [83.3, 17.7],
  "Anakapalli": [83.0, 17.7],
  "Alluri Sitharama Raju": [82.0, 17.6],
  "Kakinada": [82.2, 17.0],
  "East Godavari": [81.8, 17.3],
  "Konaseema": [82.0, 16.7],
  "West Godavari": [81.1, 16.9],
  "Eluru": [81.1, 16.7],
  "NTR": [80.6, 16.5],
  "Krishna": [80.6, 16.2],
  "Guntur": [80.4, 16.3],
  "Palnadu": [79.8, 16.2],
  "Bapatla": [80.5, 15.9],
  "Prakasam": [79.6, 15.5],
  "Sri Potti Sriramulu Nellore": [79.9, 14.4],
  "Kurnool": [78.0, 15.8],
  "Nandyal": [78.5, 15.5],
  "Anantapuramu": [77.6, 14.7],
  "Sri Sathya Sai": [77.8, 14.2],
  "YSR": [78.5, 14.5],
  "Annamayya": [79.0, 14.0],
  "Tirupati": [79.4, 13.6],
  "Chittoor": [79.1, 13.2],
};

const AndhraMapDashboard = () => {
  const { filteredProfiles, riskMap, devRiskMap } = useECDData();
  const { t } = useLanguage();
  const [geoData, setGeoData] = useState<GeoJSON | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/ap-districts.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const districtStats = useMemo(() => {
    const stats = new Map<string, { total: number; high: number; critical: number; totalDelays: number }>();
    filteredProfiles.forEach((child) => {
      const district = child.district;
      if (!stats.has(district)) stats.set(district, { total: 0, high: 0, critical: 0, totalDelays: 0 });
      const s = stats.get(district)!;
      s.total++;
      const risk = riskMap.get(child.child_id);
      if (risk) {
        const cat = risk.baseline_category?.toLowerCase();
        if (cat === "high") s.high++;
        if (cat === "critical") s.critical++;
      }
      const dev = devRiskMap.get(child.child_id);
      if (dev) s.totalDelays += dev.num_delays;
    });
    return stats;
  }, [filteredProfiles, riskMap, devRiskMap]);

  const getDistrictData = useCallback((name: string) => {
    const mapped = datasetName(name);
    const s = districtStats.get(mapped);
    if (!s || s.total === 0) return { pct: 0, total: 0, high: 0, critical: 0, avgDelay: 0 };
    return {
      pct: ((s.high + s.critical) / s.total) * 100,
      total: s.total,
      high: s.high,
      critical: s.critical,
      avgDelay: s.totalDelays / s.total,
    };
  }, [districtStats]);

  // Compute bounding box
  const bounds = useMemo(() => {
    if (!geoData) return { minLon: 76, maxLon: 85, minLat: 12, maxLat: 20 };
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const f of geoData.features) {
      const rings = f.geometry.type === "MultiPolygon"
        ? (f.geometry.coordinates as number[][][][]).flat()
        : (f.geometry.coordinates as number[][][]);
      for (const ring of rings) {
        for (const pt of ring) {
          if (pt[0] < minLon) minLon = pt[0];
          if (pt[0] > maxLon) maxLon = pt[0];
          if (pt[1] < minLat) minLat = pt[1];
          if (pt[1] > maxLat) maxLat = pt[1];
        }
      }
    }
    const padX = (maxLon - minLon) * 0.03;
    const padY = (maxLat - minLat) * 0.03;
    return { minLon: minLon - padX, maxLon: maxLon + padX, minLat: minLat - padY, maxLat: maxLat + padY };
  }, [geoData]);

  const SVG_W = 600;
  const SVG_H = 750;

  const legendItems = [
    { label: t("lowDelay"), color: "hsl(142, 71%, 45%)", range: "0–20%" },
    { label: t("moderateDelay"), color: "hsl(48, 96%, 53%)", range: "21–40%" },
    { label: t("highDelay"), color: "hsl(25, 95%, 53%)", range: "41–60%" },
    { label: t("criticalDelay"), color: "hsl(0, 84%, 60%)", range: "61%+" },
  ];

  const noDataColor = "#e2e8f0";

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-wide">{t("apMap")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">Andhra Pradesh ({t("districtSummary")})</p>
      </div>

      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4 shrink-0" />
        <span>{t("apMapInfo")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <Card className="lg:col-span-3 p-4 relative overflow-hidden">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto max-h-[650px]"
            onMouseLeave={() => setHoveredDistrict(null)}
          >
            {geoData.features.map((feature) => {
              const name = feature.properties.district;
              const data = getDistrictData(name);
              const fillColor = data.total > 0 ? getSeverityColor(data.pct) : noDataColor;
              const isHovered = hoveredDistrict === name;

              const rings = feature.geometry.type === "MultiPolygon"
                ? (feature.geometry.coordinates as number[][][][]).flat()
                : (feature.geometry.coordinates as number[][][]);

              // Label position
              const hq = DISTRICT_HQS[name];
              let labelPt: [number, number] | null = null;
              if (hq) {
                labelPt = projectPoint(hq[0], hq[1], bounds, SVG_W, SVG_H);
              } else if (rings[0]) {
                const c = getCentroid(rings[0]);
                labelPt = projectPoint(c[0], c[1], bounds, SVG_W, SVG_H);
              }

              return (
                <g key={name}>
                  {rings.map((ring, ri) => (
                    <path
                      key={ri}
                      d={coordsToPath(ring, bounds, SVG_W, SVG_H)}
                      fill={fillColor}
                      stroke="hsl(var(--border))"
                      strokeWidth={isHovered ? 2 : 0.8}
                      opacity={isHovered ? 1 : 0.88}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={(e) => {
                        setHoveredDistrict(name);
                        const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                    />
                  ))}
                  {/* District label */}
                  {labelPt && (
                    <>
                      {/* HQ dot */}
                      <circle cx={labelPt[0]} cy={labelPt[1]} r={2.5} fill="hsl(0, 84%, 40%)" pointerEvents="none" />
                      <text
                        x={labelPt[0]}
                        y={labelPt[1] - 6}
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="700"
                        fill="hsl(var(--foreground))"
                        pointerEvents="none"
                        className="select-none uppercase"
                        style={{ textShadow: "0 0 3px hsl(var(--background)), 0 0 3px hsl(var(--background))" }}
                      >
                        {name}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Compass */}
            <g transform={`translate(${SVG_W - 35}, 30)`}>
              <text x="0" y="0" textAnchor="middle" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">N</text>
              <line x1="0" y1="4" x2="0" y2="22" stroke="hsl(var(--foreground))" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
              <polygon points="-4,22 0,14 4,22" fill="hsl(var(--foreground))" />
            </g>
          </svg>

          {/* Tooltip */}
          {hoveredDistrict && (() => {
            const data = getDistrictData(hoveredDistrict);
            return (
              <div
                className="absolute bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none z-50"
                style={{ left: tooltipPos.x + 15, top: tooltipPos.y - 10 }}
              >
                <p className="font-semibold text-foreground">{hoveredDistrict}</p>
                <p className="text-muted-foreground">{t("totalChildren")}: {data.total}</p>
                <p className="text-muted-foreground">{t("highRisk")}: {data.total > 0 ? data.pct.toFixed(1) : 0}%</p>
                <p className="text-muted-foreground">{t("criticalCases")}: {data.critical}</p>
                <p className="text-muted-foreground">{t("avgDelayCount")}: {data.avgDelay.toFixed(1)}</p>
              </div>
            );
          })()}

          {/* Scale bar */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground flex items-end gap-1">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <div className="w-10 h-0.5 bg-foreground" />
                <div className="w-10 h-0.5 bg-muted-foreground" />
              </div>
              <div className="flex gap-4 mt-0.5">
                <span>0</span><span>100</span><span>200 KM</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Legend + Summary */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">{t("legend")}</h3>
            <div className="space-y-2">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.range}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: noDataColor }} />
                <span className="text-sm text-muted-foreground">No Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-700" />
                <span className="text-sm text-muted-foreground">District HQ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-border" />
                <span className="text-sm text-muted-foreground">District Boundary</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">{t("districtSummary")}</h3>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {geoData.features.map((f) => {
                const name = f.properties.district;
                const data = getDistrictData(name);
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                      hoveredDistrict === name ? "bg-muted" : ""
                    }`}
                    onMouseEnter={() => setHoveredDistrict(name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: data.total > 0 ? getSeverityColor(data.pct) : noDataColor }}
                      />
                      <span className="text-foreground text-xs">{name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {data.total > 0 ? `${data.pct.toFixed(0)}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AndhraMapDashboard;
