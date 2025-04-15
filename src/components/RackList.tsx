
import { useRackContext } from "@/context/RackContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import RackForm from "./RackForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RackList = () => {
  const { racks, selectedRackId, setSelectedRackId, deleteRack } = useRackContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRackId, setEditingRackId] = useState<string | null>(null);
  
  const editingRack = racks.find(rack => rack.id === editingRackId);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Racks</h2>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Rack
            </Button>
          </DialogTrigger>
          <DialogContent>
            <RackForm onSuccess={() => setShowCreateForm(false)} onCancel={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        {racks.map(rack => {
          const isSelected = rack.id === selectedRackId;
          const occupiedUnits = rack.units.filter(unit => unit.occupied).length;
          const utilizationPercentage = (occupiedUnits / rack.totalUnits) * 100;
          
          return (
            <div 
              key={rack.id}
              className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                isSelected ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedRackId(rack.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{rack.name}</div>
                  <div className="text-xs text-muted-foreground">{rack.location}</div>
                </div>
                {isSelected && (
                  <div className="flex space-x-1">
                    <Dialog open={editingRackId === rack.id} onOpenChange={(open) => !open && setEditingRackId(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          setEditingRackId(rack.id);
                        }}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      {editingRack && (
                        <DialogContent>
                          <RackForm 
                            existingRack={editingRack}
                            onSuccess={() => setEditingRackId(null)} 
                            onCancel={() => setEditingRackId(null)} 
                          />
                        </DialogContent>
                      )}
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Rack</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {rack.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRack(rack.id);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{occupiedUnits} / {rack.totalUnits} U used</span>
                  <span>{Math.round(utilizationPercentage)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${utilizationPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        {racks.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No racks found. Add your first rack to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default RackList;
