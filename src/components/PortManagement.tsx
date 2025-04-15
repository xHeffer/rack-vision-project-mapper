import { useState, useEffect } from "react";
import { useRackContext } from "@/context/RackContext";
import { Device, Port, PortType, PortStatus } from "@/types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2, Cable } from "lucide-react";
import PortConnectionDialog from "./PortConnectionDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Network, Usb, Power, Monitor, Terminal, Plug } from "lucide-react";

interface PortManagementProps {
  deviceId: string;
}

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

const PortManagement = ({ deviceId }: PortManagementProps) => {
  const { getDeviceById, updateDevice, deletePort, addPort } = useRackContext();
  const [ports, setPorts] = useState<Port[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedPort, setEditedPort] = useState<Port>({
    id: "",
    name: "",
    type: "ethernet",
    status: "disconnected",
  });
  const [newPort, setNewPort] = useState<Omit<Port, "id" | "status">>({
    name: "",
    type: "ethernet",
  });
  const [isPortConnectionDialogOpen, setIsPortConnectionDialogOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<{ sourceDeviceId: string; sourcePortId: string } | null>(null);
  const [isAddPortDialogOpen, setIsAddPortDialogOpen] = useState(false);
  
  useEffect(() => {
    const device = getDeviceById(deviceId);
    setPorts(device?.ports || []);
  }, [deviceId, getDeviceById]);
  
  const handleEdit = (port: Port) => {
    setIsEditing(port.id);
    setEditedPort({ ...port });
  };
  
  const handleSave = () => {
    const device = getDeviceById(deviceId);
    if (!device) return;
    
    const updatedPorts = device.ports.map(port =>
      port.id === editedPort.id ? editedPort : port
    );
    
    updateDevice({ ...device, ports: updatedPorts });
    setIsEditing(null);
  };
  
  const handleCancel = () => {
    setIsEditing(null);
  };
  
  const handleDelete = (portId: string) => {
    const device = getDeviceById(deviceId);
    if (!device) return;
    
    deletePort(deviceId, portId);
  };
  
  const handlePortValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedPort(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOpenPortConnectionDialog = (port: Port) => {
    setSelectedPort({ sourceDeviceId: deviceId, sourcePortId: port.id });
    setIsPortConnectionDialogOpen(true);
  };
  
  const handleClosePortConnectionDialog = () => {
    setSelectedPort(null);
    setIsPortConnectionDialogOpen(false);
  };

  const handleAddPort = () => {
    addPort(deviceId, newPort);
    setIsAddPortDialogOpen(false);
    setNewPort({ name: "", type: "ethernet" });
  };

  return (
    <div>
      <div className="md:flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Port Management</h2>
        <Button size="sm" onClick={() => setIsAddPortDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Port
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map(port => (
            <TableRow key={port.id}>
              <TableCell>
                {isEditing === port.id ? (
                  <Input
                    type="text"
                    name="name"
                    value={editedPort.name}
                    onChange={handlePortValueChange}
                  />
                ) : (
                  <div className="flex items-center">
                    <PortIcon type={port.type} />
                    <span className="ml-2">{port.name}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {isEditing === port.id ? (
                  <Select value={editedPort.type} onValueChange={(value) => setEditedPort(prev => ({ ...prev, type: value as PortType }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ethernet">Ethernet</SelectItem>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="power">Power</SelectItem>
                        <SelectItem value="hdmi">HDMI</SelectItem>
                        <SelectItem value="serial">Serial</SelectItem>
                        <SelectItem value="fiber">Fiber</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  port.type
                )}
              </TableCell>
              <TableCell>
                <Badge variant={port.status === 'connected' ? 'default' : 'outline'}>
                  {port.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {isEditing === port.id ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={handleSave}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenPortConnectionDialog(port)}>
                      <Cable className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(port)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the port from your device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(port.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <PortConnectionDialog
        open={isPortConnectionDialogOpen}
        onOpenChange={setIsPortConnectionDialogOpen}
        sourceDeviceId={selectedPort?.sourceDeviceId || ""}
        sourcePortId={selectedPort?.sourcePortId || ""}
      />

      <Dialog open={isAddPortDialogOpen} onOpenChange={setIsAddPortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Port</DialogTitle>
            <DialogDescription>
              Create a new port for this device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                type="text"
                id="name"
                value={newPort.name}
                onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right">
                Type
              </label>
              <Select value={newPort.type} onValueChange={(value) => setNewPort({ ...newPort, type: value as PortType })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ethernet">Ethernet</SelectItem>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="hdmi">HDMI</SelectItem>
                    <SelectItem value="serial">Serial</SelectItem>
                    <SelectItem value="fiber">Fiber</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPortDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPort}>Add Port</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortManagement;
