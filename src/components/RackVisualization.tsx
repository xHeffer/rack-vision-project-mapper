
import { useRackContext } from "@/context/RackContext";
import { RackUnit } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeviceDetails from "./DeviceDetails";
import { useState } from "react";

const RackVisualization = () => {
  const { 
    selectedRackId, 
    getRackById, 
    getDeviceById,
    setSelectedDeviceId,
    selectedDeviceId
  } = useRackContext();
  const [viewType, setViewType] = useState<'front' | 'back'>('front');
  
  const rack = getRackById(selectedRackId || undefined);
  
  if (!rack) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Select a rack to view</p>
      </div>
    );
  }
  
  const handleUnitClick = (unit: RackUnit) => {
    if (unit.deviceId) {
      setSelectedDeviceId(unit.deviceId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{rack.name}</h2>
          <p className="text-muted-foreground">{rack.location}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewType === 'front' ? 'default' : 'outline'} 
            onClick={() => setViewType('front')}
            size="sm"
          >
            Front View
          </Button>
          <Button 
            variant={viewType === 'back' ? 'default' : 'outline'} 
            onClick={() => setViewType('back')}
            size="sm"
          >
            Back View
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-grow border border-rack-border rounded-md p-1 bg-rack-bg overflow-y-auto">
        <div className="text-center bg-rack-rail py-1 rounded-t-sm text-xs text-muted-foreground">
          {viewType === 'front' ? 'FRONT' : 'BACK'}
        </div>
        <div className="flex-grow relative border-l border-r border-rack-rail">
          {rack.units.map((unit) => {
            const device = unit.deviceId ? getDeviceById(unit.deviceId) : undefined;
            const isFirstUnitOfDevice = device && rack.units.find(u => 
              u.deviceId === unit.deviceId && u.position === (unit.position + device.unitHeight - 1)
            );
            
            // Only render the device once at its lowest position
            const shouldRenderDevice = device && isFirstUnitOfDevice;
            const deviceHeight = device ? `${device.unitHeight * 1.5}rem` : '1.5rem';
            
            return (
              <div 
                key={unit.id}
                className={`rack-unit flex items-center border-b border-rack-rail relative ${
                  unit.occupied ? 'bg-rack-occupied' : 'bg-rack-free'
                } ${
                  shouldRenderDevice ? 'cursor-pointer' : ''
                }`}
                style={{ 
                  height: unit.occupied && !shouldRenderDevice ? '0' : '1.5rem',
                  overflow: 'hidden',
                  opacity: unit.occupied && !shouldRenderDevice ? 0 : 1
                }}
                onClick={() => shouldRenderDevice && handleUnitClick(unit)}
              >
                <div className="w-8 h-full flex items-center justify-center border-r border-rack-rail text-xs text-muted-foreground">
                  {unit.position}
                </div>
                
                {shouldRenderDevice && device && (
                  <div 
                    className="flex flex-col justify-between p-2 w-full"
                    style={{ height: deviceHeight }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className={`device-status-light status-${device.status} animate-pulse-slow`}></div>
                          <span className="font-medium">{device.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {device.brand} {device.model}
                        </div>
                      </div>
                      <Badge variant="outline">{device.type}</Badge>
                    </div>
                    
                    {device.unitHeight > 2 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {device.serialNumber}
                        {device.ipAddress && ` • ${device.ipAddress}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center bg-rack-rail py-1 rounded-b-sm text-xs text-muted-foreground">
          {rack.totalUnits}U
        </div>
      </div>

      {selectedDeviceId && (
        <Dialog open={!!selectedDeviceId} onOpenChange={(open) => !open && setSelectedDeviceId(null)}>
          <DialogContent className="max-w-2xl">
            <DeviceDetails deviceId={selectedDeviceId} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RackVisualization;
