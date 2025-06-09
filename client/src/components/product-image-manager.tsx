import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ArrowUp, ArrowDown, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProductImage } from "@shared/schema";

interface ProductImageManagerProps {
  productId: number;
}

export default function ProductImageManager({ productId }: ProductImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePriority, setNewImagePriority] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<ProductImage[]>({
    queryKey: ["/api/admin/products", productId, "images"],
    queryFn: () => fetch(`/api/admin/products/${productId}/images`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    }).then(res => res.json()),
  });

  const createImageMutation = useMutation({
    mutationFn: async (imageData: any) => {
      return apiRequest(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: JSON.stringify(imageData),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", productId, "images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "images"] });
      setNewImageUrl("");
      setNewImageFile(null);
      setNewImagePriority(0);
      toast({
        title: "Success",
        description: "Image added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ imageId, priority }: { imageId: number; priority: number }) => {
      return apiRequest(`/api/admin/product-images/${imageId}/priority`, {
        method: "PUT",
        body: JSON.stringify({ priority }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", productId, "images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "images"] });
      toast({
        title: "Success",
        description: "Priority updated successfully",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/admin/product-images/${imageId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", productId, "images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "images"] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      // Clear URL when file is selected
      setNewImageUrl("");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddImage = async () => {
    if (!newImageUrl && !newImageFile) {
      toast({
        title: "Error",
        description: "Please provide either an image URL or upload a file",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageData: any = {
        priority: newImagePriority,
      };

      if (newImageFile) {
        const base64 = await convertFileToBase64(newImageFile);
        imageData.imageBlob = base64;
      } else {
        imageData.imageUrl = newImageUrl;
      }

      createImageMutation.mutate(imageData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = (imageId: number, currentPriority: number, direction: 'up' | 'down') => {
    const newPriority = direction === 'up' ? currentPriority - 1 : currentPriority + 1;
    updatePriorityMutation.mutate({ imageId, priority: newPriority });
  };

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Image */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Add New Image</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  if (e.target.value) setNewImageFile(null);
                }}
                placeholder="https://example.com/image.jpg"
                disabled={!!newImageFile}
              />
            </div>
            
            <div>
              <Label htmlFor="imageFile">Or Upload File</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!!newImageUrl}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="priority">Priority (lower number = higher priority)</Label>
            <Input
              id="priority"
              type="number"
              value={newImagePriority}
              onChange={(e) => setNewImagePriority(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          
          <Button onClick={handleAddImage} disabled={createImageMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>

        {/* Existing Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Images ({images.length})</h3>
          
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No images added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => {
                const imageUrl = image.imageBlob ? `data:image/jpeg;base64,${image.imageBlob}` : image.imageUrl;
                return (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Priority: {image.priority}</span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePriorityChange(image.id, image.priority, 'up')}
                            disabled={updatePriorityMutation.isPending}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePriorityChange(image.id, image.priority, 'down')}
                            disabled={updatePriorityMutation.isPending}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Added: {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}