import { useState } from "react";
import { useRackContext } from "@/context/RackContext";
import { Port, PortType, PortStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Network, Usb, Power, Monitor, Terminal, Plug } from "lucide-react";

const PortIcon = ({ type }: { type: PortType }) => {
  switch (type) {
    case "ethernet":
      return <Network className="h-4 w-4" />;
    case "usb":
      return <Usb className="h-4 w-4" />;
    case "power":
      return <Power className="h-4 w-4" />;
    case "hdmi":
      return <Monitor className="h-4 w-4" />;
    case "serial":
      return <Terminal className="h-4 w-4" />;
    case "fiber":
      return <Network className="h-4 w-4" />;
    default:
      return <Plug className="h-4 w-4" />;
  }
};

const PortStatusBadge = ({ status }: { status: PortStatus }) => {
  const variant = 
    status === "connected" ? "default" :
    status === "disconnected" ? "outline" :
    "destructive";
  
  return (
    <Badge variant={variant}>{status}</Badge>
  );
};

const PortManagement = ({ deviceId }: PortManagementProps) => {
  const { getDeviceById, addPort, updatePort, deletePort, devices, disconnectPort } = useRackContext();
  const device = getDeviceById(deviceId);
  
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const [isAddingPort, setIsAddingPort] = useState(false);
  const [isEditingPort, setIsEditingPort] = useState(false);
  const [viewType, setViewType] = useState<'front' | 'back'>('front');
  
  const [newPort, setNewPort] = useState<Omit<Port, 'id'>>({
    name: "",
    type: "ethernet",
    status: "disconnected",
    location: "front"
  });
  
  if (!device) return null;
  
  const selectedPort = selectedPortId ? device.ports.find(port => port.id === selectedPortId) : null;
  const connectedDevice = selectedPort?.connectedToDeviceId 
    ? devices.find(d => d.id === selectedPort.connectedToDeviceId) 
    : null;
  const connectedPort = selectedPort?.connectedToPortId && connectedDevice 
    ? connectedDevice.ports.find(p => p.id === selectedPort.connectedToPortId) 
    : null;
  
  const handleAddPort = () => {
    addPort(deviceId, newPort);
    setIsAddingPort(false);
    setNewPort({
      name: "",
      type: "ethernet",
      status: "disconnected",
      location: "front"
    });
  };
  
  const handleUpdatePort = () => {
    if (selectedPort) {
      updatePort(deviceId, selectedPort.id, newPort);
      setIsEditingPort(false);
    }
  };
  
  const handleDeletePort = () => {
    if (selectedPortId) {
      deletePort(deviceId, selectedPortId);
      setSelectedPortId(null);
    }
  };
  
  const handleDisconnectPort = () => {
    if (selectedPort) {
      disconnectPort(deviceId, selectedPort.id);
    }
  };
  
  const handleEditClick = () => {
    if (selectedPort) {
      setNewPort({
        name: selectedPort.name,
        type: selectedPort.type,
        status: selectedPort.status,
        notes: selectedPort.notes,
        speed: selectedPort.speed,
        location: selectedPort.location,
        connectedToDeviceId: selectedPort.connectedToDeviceId,
        connectedToPortId: selectedPort.connectedToPortId
      });
      setIsEditingPort(true);
    }
  };
  
  const visiblePorts = device.ports.filter(port => port.location === viewType);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ports</h3>
        <div className="flex space-x-2">
          <Button 
            variant={viewType === 'front' ? 'default' : 'outline'} 
            onClick={() => setViewType('front')}
            size="sm"
          >
            Front
          </Button>
          <Button 
            variant={viewType === 'back' ? 'default' : 'outline'} 
            onClick={() => setViewType('back')}
            size="sm"
          >
            Back
          </Button>
          <Dialog open={isAddingPort} onOpenChange={setIsAddingPort}>
            <DialogTrigger asChild>
              <Button size="sm">Add Port</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Port</DialogTitle>
                <DialogDescription>
                  Add a new port to {device.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port-name" className="text-right">Name</Label>
                  <Input 
                    id="port-name" 
                    value={newPort.name} 
                    onChange={(e) => setNewPort({...newPort, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port-type" className="text-right">Type</Label>
                  <Select 
                    value={newPort.type} 
                    onValueChange={(value) => setNewPort({...newPort, type: value as PortType})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethernet">Ethernet</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                      <SelectItem value="power">Power</SelectItem>
                      <SelectItem value="hdmi">HDMI</SelectItem>
                      <SelectItem value="serial">Serial</SelectItem>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port-speed" className="text-right">Speed</Label>
                  <Input 
                    id="port-speed" 
                    value={newPort.speed || ""} 
                    onChange={(e) => setNewPort({...newPort, speed: e.target.value})}
                    className="col-span-3" 
                    placeholder="e.g. 1Gbps (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port-location" className="text-right">Location</Label>
                  <Select 
                    value={newPort.location} 
                    onValueChange={(value) => setNewPort({...newPort, location: value as 'front' | 'back'})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front">Front</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port-notes" className="text-right">Notes</Label>
                  <Textarea 
                    id="port-notes" 
                    value={newPort.notes || ""} 
                    onChange={(e) => setNewPort({...newPort, notes: e.target.value})}
                    className="col-span-3" 
                    placeholder="Optional notes about this port"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingPort(false)}>Cancel</Button>
                <Button onClick={handleAddPort}>Add Port</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {visiblePorts.length > 0 ? (
          visiblePorts.map(port => (
            <div 
              key={port.id}
              className={`p-3 border rounded-md cursor-pointer flex items-center justify-between ${
                selectedPortId === port.id ? 'border-primary bg-accent' : 'border-border'
              }`}
              onClick={() => setSelectedPortId(port.id)}
            >
              <div className="flex items-center space-x-2">
                <PortIcon type={port.type} />
                <span>{port.name}</span>
              </div>
              <PortStatusBadge status={port.status} />
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-6 text-muted-foreground">
            No {viewType} ports configured
          </div>
        )}
      </div>
      
      {selectedPort && (
        <div className="border rounded-md p-4 mt-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <PortIcon type={selectedPort.type} />
                <h3 className="text-lg font-medium">{selectedPort.name}</h3>
                <PortStatusBadge status={selectedPort.status} />
              </div>
              
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Type:</div>
                  <div className="text-sm capitalize">{selectedPort.type}</div>
                  
                  {selectedPort.speed && (
                    <>
                      <div className="text-sm text-muted-foreground">Speed:</div>
                      <div className="text-sm">{selectedPort.speed}</div>
                    </>
                  )}
                  
                  <div className="text-sm text-muted-foreground">Location:</div>
                  <div className="text-sm capitalize">{selectedPort.location}</div>
                </div>
                
                {selectedPort.notes && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">Notes:</div>
                    <div className="text-sm p-2 bg-muted rounded-md">{selectedPort.notes}</div>
                  </div>
                )}
                
                {connectedDevice && connectedPort && (
                  <div className="mt-4">
                    <div className="text-sm font-medium">Connected to:</div>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{connectedDevice.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <PortIcon type={connectedPort.type} />
                            <span className="ml-1">{connectedPort.name}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDisconnectPort}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this port and any connections it has.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePort}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Port Dialog */}
      <Dialog open={isEditingPort} onOpenChange={setIsEditingPort}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Port</DialogTitle>
            <DialogDescription>
              Edit port {selectedPort?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port-name" className="text-right">Name</Label>
              <Input 
                id="edit-port-name" 
                value={newPort.name} 
                onChange={(e) => setNewPort({...newPort, name: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port-type" className="text-right">Type</Label>
              <Select 
                value={newPort.type} 
                onValueChange={(value) => setNewPort({...newPort, type: value as PortType})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethernet">Ethernet</SelectItem>
                  <SelectItem value="usb">USB</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="hdmi">HDMI</SelectItem>
                  <SelectItem value="serial">Serial</SelectItem>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port-speed" className="text-right">Speed</Label>
              <Input 
                id="edit-port-speed" 
                value={newPort.speed || ""} 
                onChange={(e) => setNewPort({...newPort, speed: e.target.value})}
                className="col-span-3" 
                placeholder="e.g. 1Gbps (optional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port-location" className="text-right">Location</Label>
              <Select 
                value={newPort.location} 
                onValueChange={(value) => setNewPort({...newPort, location: value as 'front' | 'back'})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port-notes" className="text-right">Notes</Label>
              <Textarea 
                id="edit-port-notes" 
                value={newPort.notes || ""} 
                onChange={(e) => setNewPort({...newPort, notes: e.target.value})}
                className="col-span-3" 
                placeholder="Optional notes about this port"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPort(false)}>Cancel</Button>
            <Button onClick={handleUpdatePort}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortManagement;
