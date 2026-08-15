"use client";

import { useState } from "react";
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
  { id: "head", name: "Head", bodySystem: "neurological", region: "head", description: "Head/brain trauma or conditions" },
  { id: "neck", name: "Neck", bodySystem: "musculoskeletal", region: "neck", description: "Neck injuries or cervical issues" },
  { id: "eyes", name: "Eyes", bodySystem: "sensory", region: "head", description: "Vision or eye conditions" },
  { id: "ears", name: "Ears", bodySystem: "sensory", region: "head", description: "Hearing or ear-related issues" },

  // Upper Body
  { id: "shoulder", name: "Shoulder", bodySystem: "musculoskeletal", region: "shoulder", description: "Shoulder joint/rotator cuff" },
  { id: "arm", name: "Arm", bodySystem: "musculoskeletal", region: "arm", description: "Upper arm injuries" },
  { id: "elbow", name: "Elbow", bodySystem: "musculoskeletal", region: "arm", description: "Elbow joint/tennis elbow" },
  { id: "wrist-hand", name: "Wrist & Hand", bodySystem: "musculoskeletal", region: "hand", description: "Wrist, hand, or finger conditions" },
  { id: "chest", name: "Chest", bodySystem: "cardiopulmonary", region: "chest", description: "Chest wall or respiratory issues" },
  { id: "back-upper", name: "Upper Back", bodySystem: "musculoskeletal", region: "back", description: "Upper/mid-back pain" },

  // Core & Lower Back
  { id: "back-lower", name: "Lower Back", bodySystem: "musculoskeletal", region: "back", description: "Lower back/lumbar spine issues" },
  { id: "abdomen", name: "Abdomen", bodySystem: "gastrointestinal", region: "abdomen", description: "GI or abdominal conditions" },

  // Lower Body
  { id: "hip", name: "Hip", bodySystem: "musculoskeletal", region: "hip", description: "Hip joint or sciatic issues" },
  { id: "knee", name: "Knee", bodySystem: "musculoskeletal", region: "leg", description: "Knee joint or ACL injuries" },
  { id: "ankle", name: "Ankle", bodySystem: "musculoskeletal", region: "foot", description: "Ankle sprains or arthritis" },
  { id: "foot", name: "Foot", bodySystem: "musculoskeletal", region: "foot", description: "Foot pain or plantar issues" },
  { id: "leg", name: "Leg", bodySystem: "musculoskeletal", region: "leg", description: "Shin splints or calf issues" },

  // Systemic
  { id: "mental-health", name: "Mental Health", bodySystem: "neurological", region: "mental", description: "PTSD, anxiety, depression" },
  { id: "skin", name: "Skin", bodySystem: "dermatological", region: "skin", description: "Rashes, eczema, or scarring" },
];

interface BodyPartSelectorProps {
  selectedPart: BodyPart | null;
  onSelect: (part: BodyPart) => void;
}

export function BodyPartSelector({ selectedPart, onSelect }: BodyPartSelectorProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Group body parts by region for visual organization
  const grouped = {
    head: BODY_PARTS.filter((p) => p.region === "head"),
    neck: BODY_PARTS.filter((p) => p.region === "neck"),
    shoulder: BODY_PARTS.filter((p) => p.region === "shoulder"),
    arm: BODY_PARTS.filter((p) => p.region === "arm"),
    hand: BODY_PARTS.filter((p) => p.region === "hand"),
    chest: BODY_PARTS.filter((p) => p.region === "chest"),
    back: BODY_PARTS.filter((p) => p.region === "back"),
    abdomen: BODY_PARTS.filter((p) => p.region === "abdomen"),
    hip: BODY_PARTS.filter((p) => p.region === "hip"),
    leg: BODY_PARTS.filter((p) => p.region === "leg"),
    foot: BODY_PARTS.filter((p) => p.region === "foot"),
    mental: BODY_PARTS.filter((p) => p.region === "mental"),
    skin: BODY_PARTS.filter((p) => p.region === "skin"),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Visual representation */}
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50">
          <div className="w-full max-w-xs">
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
            <p className="text-xs text-center text-muted-foreground mt-4">
              Click on a body region or select below
            </p>
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
