'use client';

import { useState, useEffect } from 'react';
import DocuVaultLayout from '@/components/DocuVaultLayout';

interface Item {
  id: string;
  code?: string;
  description: string;
  unit: string;
  price: number;
  tax: number;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    unit: 'pcs',
    price: 0,
    tax: 5
  });

  useEffect(() => {
    // Load items from localStorage
    const savedItems = localStorage.getItem('dv2025_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    localStorage.setItem('dv2025_items', JSON.stringify(newItems));
  };

  const deleteItem = (itemId: string) => {
    if (!confirm('Delete this item?')) return;

    const updatedItems = items.filter(i => i.id !== itemId);
    saveItems(updatedItems);
  };

  const openAddItem = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code || '',
        description: item.description,
        unit: item.unit,
        price: item.price,
        tax: item.tax
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        description: '',
        unit: 'pcs',
        price: 0,
        tax: 5
      });
    }
    setShowModal(true);
  };

  const saveItem = () => {
    if (!formData.description.trim()) {
      alert('Item description is required.');
      return;
    }

    const item: Item = {
      id: editingItem?.id || 'it_' + Date.now(),
      ...formData
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = items.map(i => i.id === editingItem.id ? item : i);
    } else {
      updatedItems = [...items, item];
    }

    saveItems(updatedItems);
    setShowModal(false);
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (items.length === 0) {
    return (
      <DocuVaultLayout
        topbarActions={
          <button className="btn btn-primary" onClick={() => openAddItem()}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
            Add Item
          </button>
        }
      >
        <div className="empty-state">
          <div className="es-icon">📦</div>
          <p>No items added yet.</p>
          <p style={{ fontSize: '12px' }}>Click "Add Item" to get started.</p>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-title">Add Item</div>
              <div className="field">
                <label>Item Code (Optional)</label>
                <input
                  value={formData.code}
                  onChange={(e) => updateFormData('code', e.target.value)}
                  placeholder="e.g. ITM001"
                />
              </div>
              <div className="field">
                <label>Description *</label>
                <input
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Unit</label>
                  <select value={formData.unit} onChange={(e) => updateFormData('unit', e.target.value)}>
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="hrs">hrs</option>
                    <option value="days">days</option>
                  </select>
                </div>
                <div className="field">
                  <label>Price (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="field">
                  <label>Tax (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => updateFormData('tax', parseFloat(e.target.value) || 0)}
                    placeholder="5.00"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveItem}>Save Item</button>
              </div>
            </div>
          </div>
        )}
      </DocuVaultLayout>
    );
  }

  return (
    <DocuVaultLayout
      topbarActions={
        <button className="btn btn-primary" onClick={() => openAddItem()}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
          Add Item
        </button>
      }
    >
      <div className="table-card">
        <div className="table-card-header">
          <h3>Items ({items.length})</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.code || '—'}</td>
                <td>{item.description}</td>
                <td>{item.unit}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.tax}%</td>
                <td>
                  <button className="btn btn-sm" onClick={() => openAddItem(item)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteItem(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editingItem ? 'Edit' : 'Add'} Item</div>
            <div className="field">
              <label>Item Code (Optional)</label>
              <input
                value={formData.code}
                onChange={(e) => updateFormData('code', e.target.value)}
                placeholder="e.g. ITM001"
              />
            </div>
            <div className="field">
              <label>Description *</label>
              <input
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="e.g. Wireless Mouse"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Unit</label>
                <select value={formData.unit} onChange={(e) => updateFormData('unit', e.target.value)}>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="m">m</option>
                  <option value="m²">m²</option>
                  <option value="m³">m³</option>
                  <option value="hrs">hrs</option>
                  <option value="days">days</option>
                </select>
              </div>
              <div className="field">
                <label>Price (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="field">
                <label>Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) => updateFormData('tax', parseFloat(e.target.value) || 0)}
                  placeholder="5.00"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveItem}>Save Item</button>
            </div>
          </div>
        </div>
      )}
    </DocuVaultLayout>
  );
}