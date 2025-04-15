
import { useRackContext } from "@/context/RackContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HardDrive, Server, Router, Database, Package2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DeviceForm from "./DeviceForm";
import PortManagement from "./PortManagement";
import PortConnectionDialog from "./PortConnectionDialog";

interface DeviceDetailsProps {
  deviceId: string;
}

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'server':
      return <Server className="h-5 w-5" />;
    case 'router':
      return <Router className="h-5 w-5" />;
    case 'switch':
      return <HardDrive className="h-5 w-5" />;
    case 'storage':
      return <Database className="h-5 w-5" />;
    default:
      return <Package2 className="h-5 w-5" />;
  }
};

const DeviceDetails = ({ deviceId }: DeviceDetailsProps) => {
  const { getDeviceById, deleteDevice, racks, selectedRackId } = useRackContext();
  const device = getDeviceById(deviceId);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'network' | 'location' | 'ports'>('info');
  const [connectPortDialogOpen, setConnectPortDialogOpen] = useState(false);
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  
  if (!device) {
    return <div>Device not found</div>;
  }

  // Find which rack this device is installed in
  const installedRack = racks.find(rack => 
    rack.units.some(unit => unit.deviceId === deviceId)
  );
  
  const unitPositions = installedRack 
    ? installedRack.units
        .filter(unit => unit.deviceId === deviceId)
        .map(unit => unit.position)
        .sort((a, b) => a - b)
    : [];
    
  const unitRange = unitPositions.length 
    ? `${Math.min(...unitPositions)} - ${Math.max(...unitPositions)}`
    : 'Not installed';

  const handleDelete = () => {
    deleteDevice(deviceId);
  };

  const handleConnectPort = (portId: string) => {
    setSelectedPortId(portId);
    setConnectPortDialogOpen(true);
  };

  return (
    <>
      {!isEditing ? (
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DeviceIcon type={device.type} />
                <DialogTitle>{device.name}</DialogTitle>
                <Badge className="ml-2" variant={device.status === 'active' ? 'default' : device.status === 'warning' ? 'outline' : 'destructive'}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </Badge>
              </div>
            </div>
            <DialogDescription>
              Device Details
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              <TabsTrigger value="network" className="flex-1">Network</TabsTrigger>
              <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
              <TabsTrigger value="ports" className="flex-1">Ports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Brand</div>
                  <div>{device.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Model</div>
                  <div>{device.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Serial Number</div>
                  <div>{device.serialNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="capitalize">{device.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Height</div>
                  <div>{device.unitHeight}U</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Power Consumption</div>
                  <div>{device.powerConsumption || 'N/A'} {device.powerConsumption ? 'W' : ''}</div>
                </div>
              </div>
              
              {device.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="p-2 bg-muted rounded-md mt-1">{device.notes}</div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">IP Address</div>
                  <div>{device.ipAddress || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">MAC Address</div>
                  <div>{device.macAddress || 'N/A'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Rack</div>
                  <div>{installedRack?.name || 'Not installed'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Position (U)</div>
                  <div>{unitRange}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data Center</div>
                  <div>{installedRack?.location || 'N/A'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ports" className="mt-4">
              <PortManagement deviceId={deviceId} />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <div className="flex space-x-2 justify-between w-full">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the device
                      and remove it from any rack.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
          </DialogFooter>
        </div>
      ) : (
        <DeviceForm 
          existingDevice={device} 
          onCancel={() => setIsEditing(false)} 
          onSuccess={() => setIsEditing(false)} 
        />
      )}
      
      <PortConnectionDialog 
        open={connectPortDialogOpen}
        onOpenChange={setConnectPortDialogOpen}
        sourceDeviceId={deviceId}
        sourcePortId={selectedPortId || ''}
      />
    </>
  );
};

export default DeviceDetails;
