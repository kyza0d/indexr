"use client";

import { useEffect, useRef, useState } from "react";

import { IoIosCloseCircleOutline } from "react-icons/io";

import { useSettings } from "@/components/Settings/Context";
import { ConfigType } from "@/types";
import { useTheme } from "next-themes";

const layout_options = [
  "Grid View", "List View", "Detail View",
  "Card View", "Table View", "Compact View",
  "Tile View",
];

const thumbnail_types = ["text", "image"];

const SettingsWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { config, setConfig } = useSettings();
  const [updatedConfig, setUpdatedConfig] = useState<ConfigType>(config);
  const settingsWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settingsWindowRef.current !== null) {
      const rect = settingsWindowRef.current.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;
      const initialLeft = (innerWidth - rect.width) / 2;
      const initialTop = (innerHeight - rect.height) / 2;

      settingsWindowRef.current.style.left = `${initialLeft}px`;
      settingsWindowRef.current.style.top = `${initialTop}px`;
    }
  }, []);

  useEffect(() => {
    setUpdatedConfig(config);
  }, [config]);

  const isCheckboxInput = (
    element: HTMLInputElement | HTMLSelectElement,
    type: string
  ): element is HTMLInputElement => {
    return element instanceof HTMLInputElement && type === "checkbox";
  };

  const updateStateKeys = (prevState: ConfigType, name: string, value: any): ConfigType => {
    if (!prevState.keys) return prevState;

    const newKeys = Object.assign({}, prevState.keys);
    newKeys[name] = value;

    return Object.assign({}, prevState, {
      keys: newKeys,
    });
  };

  const updateState = (prevState: ConfigType, name: string, value: any): ConfigType => {
    return Object.assign({}, prevState, {
      [name]: value,
    });
  };

  const [isSaved, setIsSaved] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const updatedValue = isCheckboxInput(event.target, type) ? event.target.checked : value;

    const newConfig =
      updatedConfig.keys && name in updatedConfig.keys
        ? updateStateKeys(updatedConfig, name, updatedValue)
        : updateState(updatedConfig, name, updatedValue);

    setUpdatedConfig(newConfig);
    // Removed setConfig(newConfig); to avoid immediate update of the global config
  };

  const saveConfig = () => {
    setConfig(updatedConfig); // Update the global config only when saving
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const resetConfig = () => {
    setUpdatedConfig(config);
    setIsReset(true);

    setTimeout(() => {
      setIsReset(false);
    }, 2000);
  }

  const { setTheme } = useTheme();

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => setDragging(false), { once: true });
    }

    return () => {
      if (dragging) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) {
      document.body.style.userSelect = "";
    }
  }, [dragging]);

  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    if (settingsWindowRef.current !== null) {
      let offsetX = event.clientX - settingsWindowRef.current.getBoundingClientRect().left;
      let offsetY = event.clientY - settingsWindowRef.current.getBoundingClientRect().top;

      setOffset({ offsetX, offsetY }); // Store offsets in state

      setDragging(true);
      document.body.style.userSelect = "none";
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    let clientX = event.clientX - offset.offsetX;
    let clientY = event.clientY - offset.offsetY;

    if (settingsWindowRef.current !== null) {
      const { width, height } = settingsWindowRef.current.getBoundingClientRect();

      // Boundary checks
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;

      if (clientX < 0) {
        clientX = 0;
      } else if (clientX + width > maxWidth) {
        clientX = maxWidth - width;
      }

      if (clientY < 0) {
        clientY = 0;
      } else if (clientY + height > maxHeight) {
        clientY = maxHeight - height;
      }

      settingsWindowRef.current.style.left = `${clientX}px`;
      settingsWindowRef.current.style.top = `${clientY}px`;

      setOffset({ offsetX: event.clientX - clientX, offsetY: event.clientY - clientY }); // Update offsets
    }
  };

  // Sub-components
  const Dropdown = ({ name, options, value, onChange }: any) => {
    return (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 rounded-md border border-neutral-300 px-4 pr-8 -outline-offset-1 dark:border-neutral-600 dark:bg-neutral-900"
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const Checkbox = ({ name, value, onChange }: any) => {
    return <input type="checkbox" name={name} checked={value} onChange={onChange} />;
  };

  return (
    <>
      {dragging && <div className="fixed inset-0 z-10" style={{ pointerEvents: "none" }}></div>}

      <div
        ref={settingsWindowRef}
        style={{ position: "fixed", left: "0", top: "0" }}
        className="w-[50vw] rounded-md border border-neutral-300 bg-white shadow dark:border-neutral-600 dark:bg-neutral-950"
      >
        <div
          className="sticky top-0 flex cursor-move items-center rounded-t-md border-b border-neutral-300 bg-gray-200 p-2 dark:border-neutral-600 dark:bg-neutral-900"
          onMouseDown={handleMouseDown}
        >
          <h4 className="m-0">Settings</h4>
          <button onClick={onClose} className="ml-auto">
            <IoIosCloseCircleOutline size={30} className="text-red-500 dark:text-red-400" />
          </button>
        </div>

        <div className="flex max-h-[calc(70vh-80px)] flex-col gap-y-4 overflow-auto px-6 py-4">
          <h2>Appearance</h2>
          <hr />
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
            <div className="h-full bg-[#888888]"></div>
          </div>

          <div className="flex items-center">
            <p className="mr-3">Show Key:</p>
            <div>
              <input
                type="checkbox"
                name="showKey"
                checked={updatedConfig.showKey}
                onChange={handleChange}
              />
            </div>
          </div>

          <h2>Shown Keys:</h2>

          <hr className="border-t border-gray-400" />

          {Object.entries(updatedConfig.keys).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <label htmlFor={key} className="mr-3">
                {key}:
              </label>
              <div>
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  checked={value as boolean}
                  onChange={handleChange}
                />
              </div>
            </div>
          ))}

          <h2>Layout:</h2>

          <hr className="border-top-gray-400 border" />

          <div className="flex items-center">
            <p className="mr-4">View:</p>
            <select
              name="layout"
              value={updatedConfig.layout}
              onChange={handleChange}
              className="h-10 max-w-[120px] rounded-md border border-neutral-300 px-4 pr-8 -outline-offset-1 dark:border-neutral-600 dark:bg-neutral-900"
            >
              {layout_options.map((layout) => (
                <option key={layout} value={layout}>
                  {layout}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <p className="mr-4">Theme:</p>
            <select
              name="theme"
              className="h-10 rounded-md border border-neutral-300 px-4 pr-8 -outline-offset-1 dark:border-neutral-600 dark:bg-neutral-900"
            >
              <option onClick={() => setTheme("system")} value="system">
                System
              </option>
              <option onClick={() => setTheme("light")} value="light">
                Light
              </option>
              <option onClick={() => setTheme("dark")} value="dark">
                Dark
              </option>
            </select>
          </div>

        </div>
        <div className="sticky bottom-0 flex items-center justify-start gap-3 rounded-b-md border-t border-neutral-300 bg-gray-200 p-2 dark:border-neutral-600 dark:bg-neutral-900">
          <button
            onClick={saveConfig}
            className="h-10 w-fit rounded-md px-4 -outline-offset-1 dark:border-neutral-600 dark:bg-blue-500"
          >
            {isSaved ? "Settings saved!" : "Save"}
          </button>
          <button
            onClick={resetConfig}
            className="border border-neutral-700 h-10 w-fit rounded-md px-4 -outline-offset-1"
          >
            {isReset ? "Settings reset!" : "Reset"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsWindow;
