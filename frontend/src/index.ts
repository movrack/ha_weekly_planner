// Entry point: registers the card and its editor, announces it to the card picker.
import "./weekly-planner-card";
import "./card-editor";

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "weekly-planner-card")) {
  window.customCards.push({
    type: "weekly-planner-card",
    name: "Weekly Planner",
    description: "Weekly schedules for thermostats, covers, lights and more.",
    preview: false,
  });
}
