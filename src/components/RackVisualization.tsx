
import { useRackContext } from "@/context/RackContext";
import { RackUnit } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeviceDetails from "./DeviceDetails";
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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

      <div className="flex-grow border border-rack-border rounded-md bg-rack-bg overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal" 
          className="h-full rounded-md"
        >
          <ResizablePanel defaultSize={15} minSize={10} maxSize={20} className="border-r border-rack-rail">
            {/* Unit numbers column */}
            <div className="h-full flex flex-col">
              <div className="text-center bg-rack-rail py-1 text-xs text-muted-foreground">
                UNITS
              </div>
              <div className="flex-grow">
                {rack.units.map((unit) => (
                  <div 
                    key={`number-${unit.id}`}
                    className="h-6 flex items-center justify-center border-b border-rack-rail text-xs text-muted-foreground"
                  >
                    {unit.position}
                  </div>
                ))}
              </div>
              <div className="text-center bg-rack-rail py-1 text-xs text-muted-foreground">
                {rack.totalUnits}U
              </div>
            </div>
          </ResizablePanel>
          
          <ResizablePanel defaultSize={85} minSize={50} className="relative">
            <div className="h-full flex flex-col">
              <div className="text-center bg-rack-rail py-1 text-xs text-muted-foreground">
                {viewType === 'front' ? 'FRONT' : 'BACK'}
              </div>
              <div className="flex-grow relative">
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
                        overflow: shouldRenderDevice ? 'visible' : 'hidden',
                        opacity: unit.occupied && !shouldRenderDevice ? 0 : 1
                      }}
                      onClick={() => shouldRenderDevice && handleUnitClick(unit)}
                    >
                      {shouldRenderDevice && device && (
                        <div 
                          className="flex flex-col justify-between p-2 w-full"
                          style={{ height: deviceHeight }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                              <div className="flex items-center">
                                <div className={`device-status-light status-${device.status} animate-pulse-slow`}></div>
                                <span className="font-medium truncate">{device.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {device.brand} {device.model}
                              </div>
                            </div>
                            <Badge variant="outline" className="whitespace-nowrap ml-2">{device.type}</Badge>
                          </div>
                          
                          {device.unitHeight > 2 && (
                            <div className="text-xs text-muted-foreground mt-2 truncate">
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
              <div className="text-center bg-rack-rail py-1 text-xs text-muted-foreground">
                {rack.totalUnits}U
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
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
