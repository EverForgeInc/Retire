"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BodyPart = {
  id: string;
  name: string;
  bodySystem: string;
  region: string;
  description: string;
};

export const BODY_PARTS: BodyPart[] = [
  // Head & Neck
  { id: "head", name: "Head / Brain", bodySystem: "neurological", region: "head", description: "Head, brain, or scalp conditions" },
  { id: "face", name: "Face", bodySystem: "sensory", region: "face", description: "Facial conditions or injury" },
  { id: "jaw-tmj", name: "Jaw / TMJ", bodySystem: "dental", region: "jaw", description: "Jaw, bite, or temporomandibular issues" },
  { id: "eyes", name: "Eyes / Vision", bodySystem: "sensory", region: "vision", description: "Left, right, or bilateral vision conditions" },
  { id: "ears", name: "Ears / Hearing", bodySystem: "sensory", region: "hearing", description: "Left, right, or bilateral hearing conditions" },
  { id: "nose-sinus", name: "Nose / Sinus", bodySystem: "respiratory", region: "nose-sinus", description: "Nasal or sinus conditions" },

  // Upper Body
  { id: "shoulder", name: "Shoulder", bodySystem: "musculoskeletal", region: "shoulder", description: "Left, right, or bilateral shoulder conditions" },
  { id: "upper-arm", name: "Upper Arm", bodySystem: "musculoskeletal", region: "upper-arm", description: "Upper arm injuries" },
  { id: "elbow", name: "Elbow", bodySystem: "musculoskeletal", region: "elbow", description: "Left or right elbow conditions" },
  { id: "forearm", name: "Forearm", bodySystem: "musculoskeletal", region: "forearm", description: "Forearm conditions" },
  { id: "wrist", name: "Wrist", bodySystem: "musculoskeletal", region: "wrist", description: "Left or right wrist conditions" },
  { id: "hand-fingers", name: "Hand / Fingers", bodySystem: "musculoskeletal", region: "hand", description: "Hand, thumb, or finger conditions" },
  { id: "chest", name: "Chest / Ribs", bodySystem: "cardiopulmonary", region: "chest", description: "Chest wall, rib, or respiratory issues" },
  { id: "back-upper", name: "Thoracic / Upper Back", bodySystem: "musculoskeletal", region: "thoracic-spine", description: "Upper or mid-back conditions" },

  // Core & Lower Back
  { id: "back-lower", name: "Lumbar / Lower Back", bodySystem: "musculoskeletal", region: "lumbar-spine", description: "Lower back or lumbar spine issues" },
  { id: "abdomen", name: "Abdomen", bodySystem: "gastrointestinal", region: "abdomen", description: "GI or abdominal conditions" },
  { id: "pelvis-groin", name: "Pelvis / Groin", bodySystem: "genitourinary", region: "pelvis", description: "Pelvic, groin, or reproductive conditions" },

  // Lower Body
  { id: "hip", name: "Hip", bodySystem: "musculoskeletal", region: "hip", description: "Left, right, or bilateral hip conditions" },
  { id: "thigh", name: "Thigh", bodySystem: "musculoskeletal", region: "thigh", description: "Thigh conditions" },
  { id: "knee", name: "Knee", bodySystem: "musculoskeletal", region: "knee", description: "Left, right, or bilateral knee conditions" },
  { id: "shin-calf", name: "Shin / Calf", bodySystem: "musculoskeletal", region: "lower-leg", description: "Shin or calf conditions" },
  { id: "ankle", name: "Ankle", bodySystem: "musculoskeletal", region: "ankle", description: "Left or right ankle conditions" },
  { id: "heel-foot", name: "Heel / Foot", bodySystem: "musculoskeletal", region: "foot", description: "Heel, arch, ball, or foot conditions" },
  { id: "toes", name: "Big Toe / Toes", bodySystem: "musculoskeletal", region: "toes", description: "Big toe or other toe conditions" },

  // Systemic
  { id: "mental-health", name: "Mental Health", bodySystem: "mental-health", region: "mental", description: "PTSD, anxiety, depression, or other mental health concerns" },
  { id: "sleep", name: "Sleep", bodySystem: "sleep", region: "sleep", description: "Sleep conditions or disturbances" },
  { id: "respiratory", name: "Respiratory", bodySystem: "respiratory", region: "respiratory", description: "Breathing or lung conditions" },
  { id: "digestive", name: "Digestive", bodySystem: "gastrointestinal", region: "digestive", description: "Digestive system conditions" },
  { id: "genitourinary", name: "Genitourinary / Reproductive", bodySystem: "genitourinary", region: "genitourinary", description: "Genitourinary or reproductive conditions" },
  { id: "skin", name: "Skin", bodySystem: "dermatological", region: "skin", description: "Rashes, eczema, or scarring" },
];

interface BodyPartSelectorProps {
  selectedPart: BodyPart | null;
  onSelect: (part: BodyPart) => void;
}

export function BodyPartSelector({ selectedPart, onSelect }: BodyPartSelectorProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [view, setView] = useState<"quick" | "detailed">("quick");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-1" role="tablist" aria-label="Body map view">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={view === "quick"}
            onClick={() => setView("quick")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              view === "quick"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quick Select
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "detailed"}
            onClick={() => setView("detailed")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              view === "detailed"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Detailed Worksheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Visual representation */}
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50">
          <div className="w-full max-w-xs">
            <div className="relative overflow-hidden rounded-md border bg-white">
              <Image
                src={
                  view === "quick"
                    ? "/images/va/va-claims-body-map.png"
                    : "/images/va/detailed-body-location-map.png"
                }
                alt={
                  view === "quick"
                    ? "VA claims body map showing common body regions"
                    : "Detailed numbered front and back body-location worksheet"
                }
                width={view === "quick" ? 1103 : 1222}
                height={view === "quick" ? 1426 : 1287}
                className="h-auto max-h-[400px] w-full object-contain"
                priority
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              {view === "quick"
                ? "Use the visual guide, then choose a matching region below."
                : "Use the numbered worksheet as an advanced reference, then choose a region below."}
            </p>
          </div>
          <div className="hidden">
            <svg
              viewBox="0 0 100 250"
              className="w-full h-auto"
              style={{ maxHeight: "400px" }}
            >
              {/* Head */}
              <circle
                cx="50"
                cy="25"
                r="15"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPart?.region === "head"
                    ? "fill-emerald-500 stroke-emerald-700"
                    : hoveredPart === "head"
                      ? "fill-blue-300 stroke-blue-500"
                      : "fill-slate-300 stroke-slate-400"
                )}
                strokeWidth="1"
                onClick={() => onSelect(BODY_PARTS[0])}
                onMouseEnter={() => setHoveredPart("head")}
                onMouseLeave={() => setHoveredPart(null)}
              />

              {/* Neck */}
              <rect
                x="45"
                y="40"
                width="10"
                height="8"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPart?.region === "neck"
                    ? "fill-emerald-500 stroke-emerald-700"
                    : hoveredPart === "neck"
                      ? "fill-blue-300 stroke-blue-500"
                      : "fill-slate-300 stroke-slate-400"
                )}
                strokeWidth="1"
                onClick={() => onSelect(BODY_PARTS[1])}
                onMouseEnter={() => setHoveredPart("neck")}
                onMouseLeave={() => setHoveredPart(null)}
              />

              {/* Torso */}
              <rect
                x="35"
                y="48"
                width="30"
                height="45"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPart?.region === "chest" || selectedPart?.region === "back"
                    ? "fill-emerald-500 stroke-emerald-700"
                    : hoveredPart === "chest" || hoveredPart === "back"
                      ? "fill-blue-300 stroke-blue-500"
                      : "fill-slate-300 stroke-slate-400"
                )}
                strokeWidth="1"
                onClick={() => onSelect(BODY_PARTS[8])}
                onMouseEnter={() => setHoveredPart("chest")}
                onMouseLeave={() => setHoveredPart(null)}
              />

              {/* Left Arm */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[5])}
                onMouseEnter={() => setHoveredPart("arm")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="10"
                  y="50"
                  width="22"
                  height="40"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "arm"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "arm"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>

              {/* Right Arm */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[5])}
                onMouseEnter={() => setHoveredPart("arm")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="68"
                  y="50"
                  width="22"
                  height="40"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "arm"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "arm"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>

              {/* Left Leg */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[12])}
                onMouseEnter={() => setHoveredPart("leg")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="38"
                  y="93"
                  width="10"
                  height="50"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "leg"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "leg"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>

              {/* Right Leg */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[12])}
                onMouseEnter={() => setHoveredPart("leg")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="52"
                  y="93"
                  width="10"
                  height="50"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "leg"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "leg"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>

              {/* Left Foot */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[14])}
                onMouseEnter={() => setHoveredPart("foot")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="38"
                  y="143"
                  width="10"
                  height="12"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "foot"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "foot"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>

              {/* Right Foot */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => onSelect(BODY_PARTS[14])}
                onMouseEnter={() => setHoveredPart("foot")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <rect
                  x="52"
                  y="143"
                  width="10"
                  height="12"
                  className={cn(
                    "transition-all",
                    selectedPart?.region === "foot"
                      ? "fill-emerald-500 stroke-emerald-700"
                      : hoveredPart === "foot"
                        ? "fill-blue-300 stroke-blue-500"
                        : "fill-slate-300 stroke-slate-400"
                  )}
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Right side - Detailed options */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Select injury location:</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {BODY_PARTS.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => onSelect(part)}
                  onMouseEnter={() => setHoveredPart(part.region)}
                  onMouseLeave={() => setHoveredPart(null)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    selectedPart?.id === part.id
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500"
                      : "border-border hover:border-emerald-300 hover:bg-emerald-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{part.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {part.bodySystem}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{part.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected part summary */}
          {selectedPart && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-900">{selectedPart.name}</p>
                  <p className="text-xs text-emerald-700">System: {selectedPart.bodySystem}</p>
                  <p className="text-xs text-muted-foreground">{selectedPart.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
