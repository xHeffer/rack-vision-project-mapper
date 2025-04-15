
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRackContext } from "@/context/RackContext";
import { Rack } from "@/types";
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
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RackFormProps {
  existingRack?: Rack;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const rackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  totalUnits: z.coerce.number().min(1).max(60),
});

type FormValues = z.infer<typeof rackSchema>;

const RackForm = ({ existingRack, onSuccess, onCancel }: RackFormProps) => {
  const { addRack, updateRack } = useRackContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(rackSchema),
    defaultValues: existingRack ? {
      name: existingRack.name,
      location: existingRack.location,
      totalUnits: existingRack.totalUnits,
    } : {
      name: "",
      location: "",
      totalUnits: 42,
    }
  });
  
  const onSubmit = (values: FormValues) => {
    if (existingRack) {
      // For updates, we want to preserve the existing units and just update other fields
      updateRack({
        ...existingRack,
        name: values.name,
        location: values.location,
      });
    } else {
      addRack(values.name, values.location, values.totalUnits);
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{existingRack ? "Edit Rack" : "Add New Rack"}</DialogTitle>
        </DialogHeader>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rack Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Rack A01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Data Center 1 - Row 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="totalUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Units</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={60} 
                  {...field} 
                  disabled={!!existingRack}
                />
              </FormControl>
              <FormDescription>
                Standard racks are typically 42U, but can range from 1U to 60U
                {existingRack && " (Cannot be changed after creation)"}
              </FormDescription>
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
            {existingRack ? "Update Rack" : "Add Rack"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RackForm;
