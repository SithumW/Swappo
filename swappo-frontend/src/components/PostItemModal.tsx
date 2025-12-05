import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCreateItem } from '@/hooks/useItems';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  MapPin, 
  Image as ImageIcon,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import "@/styles/components/PostItemModal.css";

interface PostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  'Electronics', 
  'Furniture', 
  'Clothing', 
  'Books', 
  'Sports & Fitness', 
  'Home & Garden', 
  'Toys & Games',
  'Automotive',
  'Musical Instruments',
  'Art & Crafts'
];

const conditions = [
  { value: 'NEW', label: 'New - Never used' },
  { value: 'GOOD', label: 'Good - Minor wear' },
  { value: 'FAIR', label: 'Fair - Visible wear' },
  { value: 'POOR', label: 'Poor - Heavy wear' }
];

export const PostItemModal: React.FC<PostItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const createItemMutation = useCreateItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    latitude: '',
    longitude: '',
    phone_number: '',
    whatsapp_number: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const isSubmitting = createItemMutation.isPending;

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      // Check file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/i)) {
        toast.error(`${file.name} is not a valid image format`);
        continue;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLocationLoading(true);
    toast.info('Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        setIsLocationLoading(false);
        toast.success('Location set successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocationLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('Failed to get your location. Please enter manually.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3 || formData.title.length > 100) {
      newErrors.title = 'Title must be 3-100 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10 || formData.description.length > 1000) {
      newErrors.description = 'Description must be 10-1000 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    // Phone number validation (required)
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      // Phone number regex: supports various formats (+1234567890, 1234567890, 123-456-7890, etc.)
      const phoneRegex = /^[\+]?[0-9]?[\s\-\(\)]?[0-9]{3,4}[\s\-\(\)]?[0-9]{3,4}[\s\-]?[0-9]{3,4}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }

    // WhatsApp number validation (optional)
    if (formData.whatsapp_number.trim()) {
      // Same phone regex for WhatsApp number
      const phoneRegex = /^[\+]?[0-9]?[\s\-\(\)]?[0-9]{3,4}[\s\-\(\)]?[0-9]{3,4}[\s\-]?[0-9]{3,4}$/;
      if (!phoneRegex.test(formData.whatsapp_number.trim())) {
        newErrors.whatsapp_number = 'Please enter a valid WhatsApp number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to post items');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('phone_number', formData.phone_number.trim());
      
      // Add optional WhatsApp number if provided
      if (formData.whatsapp_number.trim()) {
        submitData.append('whatsapp_number', formData.whatsapp_number.trim());
      }
      
      // Add location if provided
      if (formData.latitude && formData.longitude) {
        submitData.append('latitude', formData.latitude);
        submitData.append('longitude', formData.longitude);
      }

      // Add images
      images.forEach((image) => {
        submitData.append('images', image);
      });

      await createItemMutation.mutateAsync(submitData);
      
      resetForm();
      onClose();
      onSuccess?.();

    } catch (error: any) {
      console.error('Failed to post item:', error);
      // Error toast is already handled by the mutation
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      condition: '',
      latitude: '',
      longitude: '',
      phone_number: '',
      whatsapp_number: '',
    });
    setImages([]);
    // Cleanup image previews
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setErrors({});
    setIsLocationLoading(false);
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="modal-content"
        style={{
          width: '600px',
          minWidth: '600px',
          maxWidth: '600px'
        }}
      >
        <DialogHeader>
          
          <DialogTitle className="modal-title">Post New Item</DialogTitle>
          <DialogDescription className="modal-description">
            Share an item you'd like to trade with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <Label htmlFor="title">Title <span className="required">*</span></Label>
            <Input
              id="title"
              placeholder="Enter title here..."
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <div className="error-message"><AlertCircle className="icon" />{errors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <Label htmlFor="description">Description <span className="required">*</span></Label>
            <Textarea
              id="description"
              placeholder="Describe your item in detail (minimum 10 characters)..."
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              className={errors.description ? 'input-error' : ''}
              rows={4}
            />
            <div className="char-count">{formData.description.length}/1000</div>
            {errors.description && <div className="error-message"><AlertCircle className="icon" />{errors.description}</div>}
          </div>

          {/* Category & Condition */}
          <div className="form-row">
            <div className="form-group">
              <Label>Category <span className="required">*</span></Label>
              <Select value={formData.category} onValueChange={v => handleInputChange('category', v)} disabled={isSubmitting}>
                <SelectTrigger className={errors.category ? 'input-error' : ''}><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {errors.category && <div className="error-message"><AlertCircle className="icon" />{errors.category}</div>}
            </div>

            <div className="form-group">
              <Label>Condition <span className="required">*</span></Label>
              <Select value={formData.condition} onValueChange={v => handleInputChange('condition', v)} disabled={isSubmitting}>
                <SelectTrigger className={errors.condition ? 'input-error' : ''}><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>{conditions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              {errors.condition && <div className="error-message"><AlertCircle className="icon" />{errors.condition}</div>}
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="form-row">
            <div className="form-group">
              <Label>Phone Number <span className="required">*</span></Label>
              <Input value={formData.phone_number} onChange={e => handleInputChange('phone_number', e.target.value)} disabled={isSubmitting} className={errors.phone_number ? 'input-error' : ''}/>
              {errors.phone_number && <div className="error-message"><AlertCircle className="icon" />{errors.phone_number}</div>}
            </div>

            <div className="form-group">
              <Label>WhatsApp Number (Optional)</Label>
              <Input value={formData.whatsapp_number} onChange={e => handleInputChange('whatsapp_number', e.target.value)} disabled={isSubmitting} className={errors.whatsapp_number ? 'input-error' : ''}/>
              {errors.whatsapp_number && <div className="error-message"><AlertCircle className="icon" />{errors.whatsapp_number}</div>}
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <Label>Location (Optional)</Label>
            <div className="location-row">
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation} 
                disabled={isSubmitting || isLocationLoading}
              >
                {isLocationLoading ? (
                  <Loader2 className="icon icon-spin" />
                ) : (
                  <MapPin className="icon" />
                )}
                {isLocationLoading ? 'Getting Location...' : 'Use My Location'}
              </Button>
              <div className="location-inputs" style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <Input placeholder="Latitude" value={formData.latitude} onChange={e => handleInputChange('latitude', e.target.value)} disabled={isSubmitting} className={errors.latitude ? 'input-error' : ''}/>
                  {errors.latitude && <div className="error-message">{errors.latitude}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <Input placeholder="Longitude" value={formData.longitude} onChange={e => handleInputChange('longitude', e.target.value)} disabled={isSubmitting} className={errors.longitude ? 'input-error' : ''}/>
                  {errors.longitude && <div className="error-message">{errors.longitude}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-group">
            <Label>Images (Optional - Max 5)</Label>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || images.length >= 5}><Upload className="icon" />Upload Images ({images.length}/5)</Button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden-input"/>
            <div className="image-previews">
              {imagePreviews.length > 0 ? imagePreviews.map((preview, index) => (
                <Card key={index} className="image-card">
                  <CardContent className="image-card-content">
                    <img src={preview} alt={`Preview ${index + 1}`} className="image-preview"/>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)} disabled={isSubmitting} className="image-remove-btn"><X className="icon"/></Button>
                  </CardContent>
                </Card>
              )) : (
                <Card className="image-placeholder">
                  <CardContent className="image-placeholder-content"><ImageIcon className="icon-large"/><p>No images selected. Click "Upload Images" to add photos.</p></CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="icon-spin"/>Posting...</> : 'Post Item'}
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
};

