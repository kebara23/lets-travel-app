import { 
  Wind, 
  Bed, 
  Waves, 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  Thermometer, 
  Utensils, 
  Trash2,
  Droplets,
  Zap,
  Hammer,
  RotateCcw
} from "lucide-react";

export interface HarmonyTask {
  id: string;
  label: string;
  category: "Cleaning" | "Amenities" | "Energy" | "Technical";
  icon: any;
}

export const getChecklistForSpace = (space: any): HarmonyTask[] => {
  const tasks: HarmonyTask[] = [];
  const features = space.features || {};

  // 1. BASE SPIRITUAL TASKS (Always present in Awake)
  tasks.push({ id: "base-1", label: "Smudge with Palo Santo / Sage", category: "Energy", icon: Flame });

  // 2. CORE CLEANING (Conditional)
  if (space.type !== 'Common' && space.type !== 'Temple') {
    tasks.push({ id: "core-1", label: "Change Linens & Bedding", category: "Cleaning", icon: Bed });
  }

  // 3. DYNAMIC FEATURE-BASED LOGIC
  if (features.kitchen) {
    tasks.push({ id: "feat-kitchen", label: "Deep Clean Kitchen & Fridge", category: "Cleaning", icon: Utensils });
  }

  if (features.ac) {
    tasks.push({ id: "feat-ac", label: "Check AC Filters & Temp", category: "Technical", icon: Thermometer });
  }

  if (features.jacuzzi) {
    tasks.push({ id: "feat-jacuzzi", label: "Sanitize & Check Hot Tub pH", category: "Technical", icon: Droplets });
  }

  if (features.laundry_internal) {
    tasks.push({ id: "feat-laundry", label: "Clean Dryer Lint Filter", category: "Technical", icon: RotateCcw });
  }

  if (features.deck) {
    tasks.push({ id: "feat-deck", label: "Sweep/Blow Leaves from Deck", category: "Cleaning", icon: Wind });
  }

  if (features.technical_check) {
    tasks.push({ id: "feat-tech", label: `Check ${features.technical_check}`, category: "Technical", icon: Hammer });
  }

  if (features.location === "river_humid") {
    tasks.push({ id: "feat-mold", label: "Dehumidifier & Mold Inspection", category: "Technical", icon: Droplets });
  }

  // 4. ROOM-SPECIFIC LOGIC (Casa Cora)
  if (space.type === 'Room' && features.bath_private === false) {
    tasks.push({ id: "room-1", label: "Check Cobwebs/Corners", category: "Cleaning", icon: Waves });
    tasks.push({ id: "room-2", label: "Empty Waste Bin & Compost", category: "Cleaning", icon: Trash2 });
  } else if (space.type !== 'Temple') {
    tasks.push({ id: "bath-1", label: "Sanitize Private Bathroom", category: "Cleaning", icon: Waves });
  }

  // 5. FINAL INSPECTION
  tasks.push({ id: "base-2", label: "Final Visual Inspection", category: "Energy", icon: Sparkles });

  return tasks;
};
