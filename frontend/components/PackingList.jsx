import { useState } from 'react';
import { FaCheck, FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function PackingList({ packingList, onUpdate }) {
  const [items, setItems] = useState(packingList?.items || []);
  const [editMode, setEditMode] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItem, setNewItem] = useState({ item: '', quantity: 1, essential: false, notes: '', packed: false });

  const toggleItemPacked = (categoryIndex, itemIndex) => {
    const updatedItems = [...items];
    updatedItems[categoryIndex].items[itemIndex].packed = !updatedItems[categoryIndex].items[itemIndex].packed;
    setItems(updatedItems);
    onUpdate?.(updatedItems);
  };

  const addNewItem = () => {
    if (!newItem.item.trim() || !newItemCategory) return;

    const categoryIndex = items.findIndex(cat => cat.name === newItemCategory);
    const updatedItems = [...items];

    if (categoryIndex >= 0) {
      updatedItems[categoryIndex].items.push({ ...newItem, packed: false });
    } else {
      updatedItems.push({
        name: newItemCategory,
        items: [{ ...newItem, packed: false }]
      });
    }

    setItems(updatedItems);
    setNewItem({ item: '', quantity: 1, essential: false, notes: '', packed: false });
    setNewItemCategory('');
    onUpdate?.(updatedItems);
  };

  const removeItem = (categoryIndex, itemIndex) => {
    const updatedItems = [...items];
    updatedItems[categoryIndex].items.splice(itemIndex, 1);
    
    // Remove category if it's empty
    if (updatedItems[categoryIndex].items.length === 0) {
      updatedItems.splice(categoryIndex, 1);
    }
    
    setItems(updatedItems);
    onUpdate?.(updatedItems);
  };

  const getPackingStats = () => {
    const totalItems = items.reduce((total, category) => total + category.items.length, 0);
    const packedItems = items.reduce((total, category) => 
      total + category.items.filter(item => item.packed).length, 0
    );
    const essentialItems = items.reduce((total, category) => 
      total + category.items.filter(item => item.essential).length, 0
    );
    const packedEssential = items.reduce((total, category) => 
      total + category.items.filter(item => item.essential && item.packed).length, 0
    );

    return { totalItems, packedItems, essentialItems, packedEssential };
  };

  const stats = getPackingStats();
  const packingProgress = stats.totalItems > 0 ? Math.round((stats.packedItems / stats.totalItems) * 100) : 0;

  const categories = [...new Set(items.map(cat => cat.name)), 'Clothing', 'Electronics', 'Personal Care', 'Documents', 'Miscellaneous'];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Packing Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{packingProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${packingProgress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.packedItems}</p>
            <p className="text-sm text-gray-500">Packed Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            <p className="text-sm text-gray-500">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.essentialItems - stats.packedEssential}</p>
            <p className="text-sm text-gray-500">Essential Left</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.essentialItems}</p>
            <p className="text-sm text-gray-500">Essential Items</p>
          </div>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <input
              type="text"
              placeholder="Item name"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addNewItem}
              disabled={!newItem.item.trim() || !newItemCategory}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Add
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="essential"
            checked={newItem.essential}
            onChange={(e) => setNewItem({ ...newItem, essential: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="essential" className="text-sm text-gray-700">Mark as essential</label>
        </div>
      </div>

      {/* Packing Categories */}
      <div className="space-y-4">
        {items.map((category, categoryIndex) => (
          <div key={category.name} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                <span className="text-sm text-gray-500">
                  {category.items.filter(item => item.packed).length} / {category.items.length} packed
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.packed 
                        ? 'bg-green-50 border-green-200' 
                        : item.essential 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleItemPacked(categoryIndex, itemIndex)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          item.packed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.packed && <FaCheck size={12} />}
                      </button>
                      
                      <div className={item.packed ? 'opacity-60' : ''}>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${item.packed ? 'line-through' : ''}`}>
                            {item.item}
                          </span>
                          {item.essential && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Essential
                            </span>
                          )}
                          {item.quantity > 1 && (
                            <span className="text-gray-500 text-sm">×{item.quantity}</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(categoryIndex, itemIndex)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {category.items.length === 0 && (
                <p className="text-center text-gray-500 py-4">No items in this category</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your packing list yet</h3>
          <p className="text-gray-500 mb-4">Start adding items to get organized for your trip!</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h5 className="font-medium text-blue-900 mb-3">🎒 Packing Tips:</h5>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Pack essentials in your carry-on bag</li>
          <li>• Roll clothes instead of folding to save space</li>
          <li>• Use packing cubes to stay organized</li>
          <li>• Check the weather forecast before finalizing your list</li>
          <li>• Leave some space for souvenirs</li>
        </ul>
      </div>
    </div>
  );
}