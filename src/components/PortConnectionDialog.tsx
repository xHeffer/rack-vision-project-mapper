import React, { useState, useEffect } from "react";
import { useRackContext } from "@/context/RackContext";
import { Device, Port } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select";
import { Cable, Network, Plug, Monitor, Terminal } from "lucide-react";

interface PortConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDeviceId: string;
  sourcePortId: string;
}

const getPortIcon = (type: string) => {
  switch (type) {
    case "ethernet":
      return <Network className="h-4 w-4 mr-1" />;
    case "usb":
      return <Terminal className="h-4 w-4 mr-1" />;
    case "power":
      return <Terminal className="h-4 w-4 mr-1" />;
    case "hdmi":
      return <Monitor className="h-4 w-4 mr-1" />;
    case "serial":
      return <Terminal className="h-4 w-4 mr-1" />;
    case "fiber":
      return <Network className="h-4 w-4 mr-1" />;
    default:
      return <Plug className="h-4 w-4 mr-1" />;
  }
};

const PortConnectionDialog = ({ open, onOpenChange, sourceDeviceId, sourcePortId }: PortConnectionDialogProps) => {
  const { devices, getDeviceById, connectPorts } = useRackContext();
  const [targetDeviceId, setTargetDeviceId] = useState<string>("");
  const [targetPortId, setTargetPortId] = useState<string>("");
  const [compatibleDevices, setCompatibleDevices] = useState<Device[]>([]);
  
  const sourceDevice = getDeviceById(sourceDeviceId);
  const sourcePort = sourceDevice?.ports.find(p => p.id === sourcePortId);
  
  useEffect(() => {
    if (open && sourceDeviceId && sourcePortId) {
      setTargetDeviceId("");
      setTargetPortId("");
      
      const filtered = devices.filter(device => {
        if (device.id === sourceDeviceId) return false;
        
        return device.ports.some(port => 
          port.status === "disconnected" && 
          port.type === sourcePort?.type
        );
      });
      
      setCompatibleDevices(filtered);
    }
  }, [open, sourceDeviceId, sourcePortId, devices, sourcePort]);
  
  const handleConnect = () => {
    if (sourceDeviceId && sourcePortId && targetDeviceId && targetPortId) {
      connectPorts(sourceDeviceId, sourcePortId, targetDeviceId, targetPortId);
      onOpenChange(false);
    }
  };
  
  const availablePorts = targetDeviceId
    ? getDeviceById(targetDeviceId)?.ports
        .filter(port => 
          port.status === "disconnected" && 
          port.type === sourcePort?.type
        ) || []
    : [];
  
  if (!sourceDevice || !sourcePort) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Port</DialogTitle>
          <DialogDescription>
            Connect {sourceDevice.name} - {sourcePort.name} to another device
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Source</h3>
            <div className="flex items-center p-2 border rounded-md">
              <div className="flex items-center">
                {getPortIcon(sourcePort.type)}
                <span className="font-medium">{sourceDevice.name}</span>
                <span className="mx-2">•</span>
                <span>{sourcePort.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({sourcePort.type}{sourcePort.speed ? `, ${sourcePort.speed}` : ""})
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Target Device</h3>
            {compatibleDevices.length > 0 ? (
              <Select value={targetDeviceId} onValueChange={setTargetDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {compatibleDevices.map(device => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center p-4 border rounded-md text-sm text-muted-foreground">
                No compatible devices with available ports found
              </div>
            )}
          </div>
          
          {targetDeviceId && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Target Port</h3>
              {availablePorts.length > 0 ? (
                <Select value={targetPortId} onValueChange={setTargetPortId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Ports ({sourcePort.type})</SelectLabel>
                      {availablePorts.map(port => (
                        <SelectItem key={port.id} value={port.id}>
                          <div className="flex items-center">
                            {getPortIcon(port.type)}
                            <span>{port.name}</span>
                            {port.speed && <span className="ml-1 text-xs">({port.speed})</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-4 border rounded-md text-sm text-muted-foreground">
                  No compatible ports available on this device
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleConnect}
            disabled={!targetDeviceId || !targetPortId}
          >
            <Cable className="mr-2 h-4 w-4" />
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortConnectionDialog;
