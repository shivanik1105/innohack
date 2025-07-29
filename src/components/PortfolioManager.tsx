import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Camera, MapPin, Calendar, Edit, Trash2, 
  Upload, CheckCircle, Star, Award, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  completedAt: string;
  skills: string[];
  createdAt: string;
}

interface PortfolioManagerProps {
  userId: string;
  portfolioItems: PortfolioItem[];
  onUpdate: (items: PortfolioItem[]) => void;
}

export default function PortfolioManager({ 
  userId, 
  portfolioItems, 
  onUpdate 
}: PortfolioManagerProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    completedAt: '',
    skills: ''
  });

  useEffect(() => {
    setItems(portfolioItems);
  }, [portfolioItems]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      completedAt: '',
      skills: ''
    });
    setSelectedImage(null);
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !selectedImage) return;

    setIsSubmitting(true);

    try {
      // Simulate API call to upload portfolio item
      const newItem: PortfolioItem = {
        id: editingItem?.id || Date.now().toString(),
        title: formData.title,
        description: formData.description,
        imageUrl: URL.createObjectURL(selectedImage), // In production, upload to server
        location: formData.location,
        completedAt: formData.completedAt,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: editingItem?.createdAt || new Date().toISOString()
      };

      let updatedItems;
      if (editingItem) {
        updatedItems = items.map(item => 
          item.id === editingItem.id ? newItem : item
        );
      } else {
        updatedItems = [newItem, ...items];
      }

      setItems(updatedItems);
      onUpdate(updatedItems);
      resetForm();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      completedAt: item.completedAt,
      skills: item.skills.join(', ')
    });
    setShowAddForm(true);
  };

  const handleDelete = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Portfolio</h2>
          <p className="text-gray-600">Showcase your best work to attract employers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Work Sample</span>
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Work Sample' : 'Add New Work Sample'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kitchen Renovation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sector 18, Noida"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the work you did, challenges faced, and results achieved..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.completedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, completedAt: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Used
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Plumbing, Electrical, Tiling"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="portfolio-image"
                    required={!editingItem}
                  />
                  <label htmlFor="portfolio-image" className="cursor-pointer">
                    {selectedImage ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-green-600 font-medium">{selectedImage.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload work photo</p>
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
                          Choose Photo
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.description}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items Yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your portfolio by adding photos of your best work
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Your First Work Sample
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="space-y-2 text-xs text-gray-500">
                  {item.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.completedAt && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {item.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {item.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{item.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Portfolio Stats */}
      {items.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Portfolio Impact</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-blue-800">Work Samples</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(items.flatMap(item => item.skills)).size}
              </div>
              <div className="text-sm text-blue-800">Skills Demonstrated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(items.map(item => item.location)).size}
              </div>
              <div className="text-sm text-blue-800">Locations Worked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
