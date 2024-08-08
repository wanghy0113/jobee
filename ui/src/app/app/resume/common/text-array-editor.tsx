"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { arraysEqual } from "@/lib/utils";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";

export function TextArrayItem({
  text,
  shouldFocus,
  onBlur,
  onChange,
  onDelete,
}: {
  text: string;
  shouldFocus?: boolean;
  onBlur?: () => void;
  onChange: (text: string) => void;
  onDelete: () => void;
}) {
  const editRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && editRef.current) {
      editRef.current.focus();
    }
  }, [shouldFocus]);

  return (
    <div className="flex items-center bg-blue-100 pl-2 h-6 rounded-md overflow-hidden">
      <ContentEditable
        innerRef={editRef}
        className="text-sm min-w-2 text-gray-900 bg-blue-100 focus:outline-none"
        contentEditable
        onBlur={onBlur}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        html={text}
      />
      <button
        className="flex items-center justify-center px-1 ml-1 cursor-pointer hover:bg-blue-300 h-full"
        onClick={onDelete}
      >
        <XMarkIcon className="h-4 w-4 fill-gray-400" />
      </button>
    </div>
  );
}

export function TextArrayEditor({
  name,
  initialItems,
  onSave,
}: {
  name: string;
  initialItems: string[];
  onSave: (items: string[]) => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const areItemsChanged = !arraysEqual(initialItems, items);

  return (
    <div className="max-w-lg border rounded-lg p-4 flex flex-col space-y-3">
      <div className="flex items-center">
        <Label>{name}</Label>
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => {
            setItems([...items, ""]);
            setIsAddingItem(true);
          }}
        >
          <PlusCircleIcon className="h-4 w-4" />
        </Button>
      </div>
      {!items.length && <div className="text-gray-500">No {name} added</div>}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <TextArrayItem
              key={`${name}-${index}`}
              text={item}
              shouldFocus={isAddingItem && index === items.length - 1}
              onDelete={() => {
                const newItems = [...items];
                newItems.splice(index, 1);
                setItems(newItems);
              }}
              onBlur={() => {
                if (isAddingItem) {
                  setIsAddingItem(false);
                }
              }}
              onChange={(text) => {
                const newItems = [...items];
                newItems[index] = text;
                setItems(newItems);
              }}
            />
          ))}
        </div>
      )}
      <div className="flex space-x-2">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => {
            setItems(initialItems);
          }}
        >
          Reset
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          disabled={!areItemsChanged}
          onClick={() => {
            onSave(items);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
