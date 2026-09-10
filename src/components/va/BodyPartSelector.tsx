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
  { id: "head", name: "Head / Brain", bodySystem: "neurological", region: "head", description: "Head, brain, or scalp conditions" },
  { id: "face", name: "Face", bodySystem: "sensory", region: "face", description: "Facial conditions or injury" },
  { id: "jaw-tmj", name: "Jaw / TMJ", bodySystem: "dental", region: "jaw", description: "Jaw, bite, or temporomandibular issues" },
  { id: "eyes", name: "Eyes / Vision", bodySystem: "sensory", region: "vision", description: "Left, right, or bilateral vision conditions" },
  { id: "ears", name: "Ears / Hearing", bodySystem: "sensory", region: "hearing", description: "Left, right, or bilateral hearing conditions" },
  { id: "nose-sinus", name: "Nose / Sinus", bodySystem: "respiratory", region: "nose-sinus", description: "Nasal or sinus conditions" },
  { id: "shoulder", name: "Shoulder", bodySystem: "musculoskeletal", region: "shoulder", description: "Left, right, or bilateral shoulder conditions" },
  { id: "upper-arm", name: "Upper Arm", bodySystem: "musculoskeletal", region: "upper-arm", description: "Upper arm injuries" },
  { id: "elbow", name: "Elbow", bodySystem: "musculoskeletal", region: "elbow", description: "Left or right elbow conditions" },
  { id: "forearm", name: "Forearm", bodySystem: "musculoskeletal", region: "forearm", description: "Forearm conditions" },
  { id: "wrist", name: "Wrist", bodySystem: "musculoskeletal", region: "wrist", description: "Left or right wrist conditions" },
  { id: "hand-fingers", name: "Hand / Fingers", bodySystem: "musculoskeletal", region: "hand", description: "Hand, thumb, or finger conditions" },
  { id: "chest", name: "Chest / Ribs", bodySystem: "cardiopulmonary", region: "chest", description: "Chest wall, rib, or respiratory issues" },
  { id: "back-upper", name: "Thoracic / Upper Back", bodySystem: "musculoskeletal", region: "thoracic-spine", description: "Upper or mid-back conditions" },
  { id: "back-lower", name: "Lumbar / Lower Back", bodySystem: "musculoskeletal", region: "lumbar-spine", description: "Lower back or lumbar spine issues" },
  { id: "abdomen", name: "Abdomen", bodySystem: "gastrointestinal", region: "abdomen", description: "GI or abdominal conditions" },
  { id: "pelvis-groin", name: "Pelvis / Groin", bodySystem: "genitourinary", region: "pelvis", description: "Pelvic, groin, or reproductive conditions" },
  { id: "hip", name: "Hip", bodySystem: "musculoskeletal", region: "hip", description: "Left, right, or bilateral hip conditions" },
  { id: "thigh", name: "Thigh", bodySystem: "musculoskeletal", region: "thigh", description: "Thigh conditions" },
  { id: "knee", name: "Knee", bodySystem: "musculoskeletal", region: "knee", description: "Left, right, or bilateral knee conditions" },
  { id: "shin-calf", name: "Shin / Calf", bodySystem: "musculoskeletal", region: "lower-leg", description: "Shin or calf conditions" },
  { id: "ankle", name: "Ankle", bodySystem: "musculoskeletal", region: "ankle", description: "Left or right ankle conditions" },
  { id: "heel-foot", name: "Heel / Foot", bodySystem: "musculoskeletal", region: "foot", description: "Heel, arch, ball, or foot conditions" },
  { id: "toes", name: "Big Toe / Toes", bodySystem: "musculoskeletal", region: "toes", description: "Big toe or other toe conditions" },
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
              view === "quick" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
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
              view === "detailed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Detailed Worksheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-6">
          <div className="w-full max-w-xs">
            <div className="relative overflow-hidden rounded-md border bg-white">
              <Image
                src={view === "quick" ? "/images/va/va-claims-body-map.png" : "/images/va/detailed-body-location-map.png"}
                alt={view === "quick" ? "VA claims body map showing common body regions" : "Detailed numbered front and back body-location worksheet"}
                width={view === "quick" ? 1103 : 1222}
                height={view === "quick" ? 1426 : 1287}
                className="h-auto max-h-[400px] w-full object-contain"
                priority
              />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {view === "quick"
                ? "Use the visual guide, then choose a matching region."
                : "Use the numbered worksheet as a reference, then choose a matching region."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Select injury location:</h3>
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {BODY_PARTS.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => onSelect(part)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-all",
                    selectedPart?.id === part.id
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500"
                      : "border-border hover:border-emerald-300 hover:bg-emerald-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{part.name}</span>
                    <Badge variant="outline" className="text-xs">{part.bodySystem}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{part.description}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedPart ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
