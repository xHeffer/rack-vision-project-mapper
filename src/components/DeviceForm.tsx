
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRackContext } from "@/context/RackContext";
import { Device, DeviceStatus, DeviceType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeviceFormProps {
  existingDevice?: Device;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["server", "switch", "router", "storage", "other"] as const),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  status: z.enum(["active", "warning", "error", "inactive"] as const),
  unitHeight: z.coerce.number().min(1).max(48),
  powerConsumption: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof deviceSchema>;

const DeviceForm = ({ existingDevice, onSuccess, onCancel }: DeviceFormProps) => {
  const { addDevice, updateDevice } = useRackContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: existingDevice ? {
      name: existingDevice.name,
      type: existingDevice.type,
      brand: existingDevice.brand,
      model: existingDevice.model,
      serialNumber: existingDevice.serialNumber,
      ipAddress: existingDevice.ipAddress || "",
      macAddress: existingDevice.macAddress || "",
      status: existingDevice.status,
      unitHeight: existingDevice.unitHeight,
      powerConsumption: existingDevice.powerConsumption || undefined,
      notes: existingDevice.notes || "",
    } : {
      name: "",
      type: "server",
      brand: "",
      model: "",
      serialNumber: "",
      ipAddress: "",
      macAddress: "",
      status: "inactive",
      unitHeight: 1,
      powerConsumption: undefined,
      notes: "",
    }
  });
  
  const onSubmit = (values: FormValues) => {
    if (existingDevice) {
      updateDevice({
        id: existingDevice.id,
        name: values.name,
        type: values.type,
        brand: values.brand,
        model: values.model,
        serialNumber: values.serialNumber,
        ipAddress: values.ipAddress,
        macAddress: values.macAddress,
        status: values.status,
        unitHeight: values.unitHeight,
        powerConsumption: values.powerConsumption,
        notes: values.notes,
        ports: existingDevice.ports, // Preserve existing ports
      });
    } else {
      addDevice({
        name: values.name,
        type: values.type,
        brand: values.brand,
        model: values.model,
        serialNumber: values.serialNumber,
        ipAddress: values.ipAddress,
        macAddress: values.macAddress,
        status: values.status,
        unitHeight: values.unitHeight,
        powerConsumption: values.powerConsumption,
        notes: values.notes,
        ports: [], // Initialize with empty ports array
      });
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{existingDevice ? "Edit Device" : "Add New Device"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Web Server 01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dell, Cisco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. PowerEdge R740" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SRV-2023-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unitHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Height (U)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={48} {...field} />
                </FormControl>
                <FormDescription>Number of rack units this device occupies</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="powerConsumption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Power Consumption (W)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ipAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Address</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="macAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MAC Address</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional: Add any additional information here" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {existingDevice ? "Update Device" : "Add Device"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DeviceForm;
