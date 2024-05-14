"use client";

import { useEffect, useRef, useState } from "react";

import { useSettings } from "@/components/settings/context";

import { ConfigType } from "@/types";

import { useTheme } from "next-themes";

import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FiX } from "react-icons/fi";

interface SettingsWindowProps {
  onClose: () => void;
}

const layoutOptions = ["Grid View", "List View", "Detail View", "Card View", "Table View", "Compact View", "Tile View"]

const SettingsWindow: React.FC<SettingsWindowProps> = ({ onClose }) => {
  const { config, setConfig } = useSettings();
  const { setTheme } = useTheme();
  const [updatedConfig, setUpdatedConfig] = useState<ConfigType>(config);
  const [isSaved, setIsSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });
  const settingsWindowRef = useRef<HTMLDivElement>(null);

  const Dropdown = ({ name, options, value, onChange }: any) => {
    return (
      <Select
        value={value}
        onValueChange={(newValue: string) => {
          onChange({
            target: {
              name,
              value: newValue,
              type: "select"
            }
          });
        }}
      >
        <SelectTrigger className="w-48" value={value}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };

  // Position the settings window in the center
  useEffect(() => {
    centerWindow();
  }, []);

  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  // Handle window dragging
  const centerWindow = () => {
    if (settingsWindowRef.current) {
      const rect = settingsWindowRef.current.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      settingsWindowRef.current.style.left = `${(innerWidth - rect.width) / 2}px`;
      settingsWindowRef.current.style.top = `${(innerHeight - rect.height) / 2}px`;
    }
  };

  const handleMouseMove = (event: MouseEvent) => { moveWindow(event.clientX, event.clientY); };
  const handleMouseDown = (event: React.MouseEvent) => { startDragging(event.clientX, event.clientY); };

  const startDragging = (clientX: number, clientY: number) => {
    if (settingsWindowRef.current) {
      const rect = settingsWindowRef.current.getBoundingClientRect();
      setOffset({
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top,
      });
      setDragging(true);
      document.body.style.userSelect = "none";
    }
  };

  const moveWindow = (clientX: number, clientY: number) => {
    if (settingsWindowRef.current) {
      const { width, height } = settingsWindowRef.current.getBoundingClientRect();

      const newX = Math.min(Math.max(clientX - offset.offsetX, 0), window.innerWidth - width);
      const newY = Math.min(Math.max(clientY - offset.offsetY, 0), window.innerHeight - height);

      settingsWindowRef.current.style.left = `${newX}px`;
      settingsWindowRef.current.style.top = `${newY}px`;
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => setDragging(false), { once: true });
    }

    return () => {
      if (dragging) { document.removeEventListener("mousemove", handleMouseMove); }
    };

  }, [dragging]);

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newValue = value;
    const newConfig = { ...updatedConfig, [name]: newValue };
    setUpdatedConfig(newConfig);
  };

  // Handle checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    // if the key isn't present in the table, instead add it to the upper level
    if (!updatedConfig.keys[name]) {
      const newConfig = { ...updatedConfig, [name]: checked }; setUpdatedConfig(newConfig);
      return;
    }
    const newConfig = { ...updatedConfig, keys: { ...updatedConfig.keys, [name]: checked } };
    setUpdatedConfig(newConfig);
  };

  // Save config to local storage
  const saveConfig = () => {
    setConfig(updatedConfig);
    setTheme(updatedConfig.theme);
    setTimeout(() => setIsSaved(false), 1000);
    setIsSaved(true);
  };

  // Render settings UI
  return (
    <>
      {dragging && <div className="fixed inset-0 z-10" style={{ pointerEvents: "none" }}></div>}
      <Card
        ref={settingsWindowRef}
        style={{ position: "fixed", left: "0", top: "0" }}
        className="z-10 w-[50vw] border">
        <div
          className="sticky top-0 flex cursor-move items-center rounded-t-md border-b p-2 overflow-y-scroll"
          onMouseDown={handleMouseDown}>
          <h4 className="m-0">Settings</h4>
          <button onClick={onClose} className="ml-auto">
            <FiX size={30} className="text-slate-300" />
          </button>
        </div>

        <div className="flex max-h-[calc(70vh-80px)] flex-col gap-y-4 overflow-auto px-6 py-4">

          <h2 className="text-2xl">Appearance</h2>

          <div>
            <label className="mr-3">Thumbnail Key:</label>
            <Dropdown
              name="thumbnailKey"
              options={Object.keys(updatedConfig.keys)}
              value={updatedConfig.thumbnailKey}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center">
            <label className="mr-3">Show key:</label>
            <Checkbox
              name="showKey"
              value={updatedConfig.showKey}
              onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "showKey", checked } })}
            />
          </div>

          {Object.entries(updatedConfig.keys).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <label htmlFor={key} className="mr-3">
                {key}:
              </label>
              <Checkbox id={key} name={key} checked={value as boolean} onCheckedChange={(checked) => handleCheckboxChange({ target: { name: key, checked } })} />
            </div>
          ))}

          <h2 className="text-2xl">Layout:</h2>
          <div className="flex items-center">
            <p className="mr-4">View:</p>
            <Dropdown
              name="layout"
              options={layoutOptions}
              value={updatedConfig.layout}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <p className="mr-4">Theme:</p>
            <Dropdown
              name="theme"
              options={["system", "light", "dark"]}
              value={updatedConfig.theme}
              onChange={(e: any) => {
                const theme = e.target.value.toLowerCase();
                setUpdatedConfig({ ...updatedConfig, theme });
              }}
            />
          </div>
        </div>
        <div className="sticky bottom-0 flex items-center justify-start gap-3 rounded-b-md border-t p-2">
          <button onClick={saveConfig} className="h-10 w-fit rounded-md px-4 -outline-offset-1 dark:bg-blue-500">
            {isSaved ? "Settings saved!" : "Save"}
          </button>
        </div>
      </Card>
    </>
  );
};

export default SettingsWindow;
