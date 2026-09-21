'use client';

import React, { useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Trash2, Plus, Layers } from 'lucide-react';

export const OptionsBuilder: React.FC = () => {
    const {
        productTitle,
        setProductTitle,
        options,
        addOptionGroup,
        updateOptionGroup,
        removeOptionGroup,
    } = useProductStore();

    const [newGroupInput, setNewGroupInput] = useState('');

    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupInput.trim()) return;
        addOptionGroup(newGroupInput.trim());
        setNewGroupInput('');
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product Base Title
                </label>
                <Input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="e.g., Premium Heavyweight T-Shirt"
                    className="h-11 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-900 bg-white shadow-none text-sm font-medium"
                />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Product Option Matrix Categories
                        </h3>
                    </div>
                </div>

                <div className="space-y-3">
                    {options.map((group) => (
                        <Card
                            key={group.id}
                            className="p-4 border-slate-200/80 shadow-none rounded-xl bg-white flex flex-col gap-3 relative group"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <Input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) =>
                                        updateOptionGroup(group.id, e.target.value, group.values)
                                    }
                                    className="h-8 w-1/2 border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-slate-50 px-2 -ml-2 rounded text-sm font-semibold text-slate-800 shadow-none outline-none transition-colors"
                                    placeholder="Option Name (e.g. Size)"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOptionGroup(group.id)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <Input
                                    type="text"
                                    value={group.values.join(', ')}
                                    onChange={(e) => {
                                        const parsedValues = e.target.value
                                            .split(',')
                                            .map((v) => v.trim());
                                        updateOptionGroup(group.id, group.name, parsedValues);
                                    }}
                                    className="h-9 border-slate-100 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-slate-400 text-xs font-medium text-slate-600 shadow-none"
                                    placeholder="Enter values separated by commas (e.g. S, M, L, XL)"
                                />
                                <span className="text-[10px] text-slate-400 block px-1">
                                    Separate each variant metric using a standard comma character.
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                <form onSubmit={handleAddGroup} className="flex items-center gap-2 pt-2">
                    <Input
                        type="text"
                        value={newGroupInput}
                        onChange={(e) => setNewGroupInput(e.target.value)}
                        placeholder="Add new category (e.g., Material)"
                        className="h-10 border-slate-200 shadow-none text-xs bg-white focus-visible:ring-1 focus-visible:ring-slate-900"
                    />
                    <Button
                        type="submit"
                        className="h-10 px-4 bg-slate-950 text-white hover:bg-slate-800 transition-colors text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                </form>
            </div>
        </div>
    );
};
