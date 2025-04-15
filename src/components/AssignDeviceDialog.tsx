
import { useRackContext } from "@/context/RackContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssignDeviceDialogProps {
  deviceId: string;
  rackId: string;
  onSuccess?: () => void;
}

const AssignDeviceDialog = ({ deviceId, rackId, onSuccess }: AssignDeviceDialogProps) => {
  const { getDeviceById, getRackById, assignDeviceToUnit } = useRackContext();
  const device = getDeviceById(deviceId);
  const rack = getRackById(rackId);
  
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  
  if (!device || !rack) {
    return <div>Device or rack not found</div>;
  }
  
  // Calculate available positions
  const availablePositions: number[] = [];
  for (let i = device.unitHeight; i <= rack.totalUnits; i++) {
    // Check if all units needed by the device are available
    const unitsNeeded = Array.from({ length: device.unitHeight }, (_, index) => i - index);
    const allUnitsAvailable = unitsNeeded.every(pos => {
      const unit = rack.units.find(u => u.position === pos);
      return unit && !unit.occupied;
    });
    
    if (allUnitsAvailable) {
      availablePositions.push(i);
    }
  }
  
  const handleAssign = () => {
    if (selectedPosition) {
      assignDeviceToUnit(deviceId, rackId, selectedPosition);
      if (onSuccess) {
        onSuccess();
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Assign {device.name} to {rack.name}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Device:</span> {device.name}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Type:</span> {device.type}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Height:</span> {device.unitHeight}U
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Rack:</span> {rack.name} ({rack.totalUnits}U)
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Select Position (U)</Label>
        {availablePositions.length > 0 ? (
          <Select onValueChange={(value) => setSelectedPosition(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a position" />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.map(pos => (
                <SelectItem key={pos} value={pos.toString()}>
                  {pos} {device.unitHeight > 1 && `- ${pos - device.unitHeight + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-destructive">
            No available positions for a {device.unitHeight}U device in this rack.
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button 
          onClick={handleAssign} 
          disabled={!selectedPosition || availablePositions.length === 0}
        >
          Assign
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AssignDeviceDialog;
