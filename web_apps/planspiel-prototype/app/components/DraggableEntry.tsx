import React from "react";
import { useDrag } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Draggable Item Component
export function DraggableItem({ id, left, top }: { id: any, left: any, top: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: { id, left, top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        padding: "20px",
        backgroundColor: "lightblue",
        border: "1px solid #ccc",
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      Item {id}
    </div>
  );
}

export function DroppableContainer() {
    
}

// Container Component
export default function DraggableEntry () {
  const items = [{id: 1, left: 50, top: 100}]
  return (
      <DndProvider backend={HTML5Backend}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "400px",
            border: "2px solid #ddd",
            backgroundColor: "#f9f9f9",
          }}
        >
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              id={item.id}
              left={item.left}
              top={item.top}
            />
          ))}
        </div>
      </DndProvider>
  );
};