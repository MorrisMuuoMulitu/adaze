"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdvancedFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    className?: string;
}

export interface FilterState {
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: string;
}

const CATEGORIES = [
    "All",
    "Men's Wear",
    "Women's Wear",
    "Kids' Wear",
    "Shoes",
    "Accessories",
    "Household",
    "Bags"
];

export function AdvancedFilters({ onFilterChange, className }: AdvancedFiltersProps) {
    const [category, setCategory] = useState<string>("All");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [isOpen, setIsOpen] = useState(false);

    const handleApplyFilters = () => {
        onFilterChange({
            category: category === "All" ? "" : category,
            minPrice: minPrice ? Number(minPrice) : null,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            sortBy,
        });
        setIsOpen(false); // Close on mobile after applying
    };

    const handleReset = () => {
        setCategory("All");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("newest");
        onFilterChange({
            category: "",
            minPrice: null,
            maxPrice: null,
            sortBy: "newest",
        });
    };

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-8 md:hidden">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full rounded-none border-border h-12 text-[10px] font-black tracking-widest uppercase"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters & Sort
                </Button>
            </div>

            <div className={`${isOpen ? 'block' : 'hidden'} md:block space-y-12`}>
                <div className="space-y-10">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                        <Filter className="w-4 h-4 text-accent" />
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Refine Selection</h3>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="rounded-none border-border h-11 text-[11px] font-bold uppercase tracking-widest">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-border">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase tracking-widest">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Price Range (KSh)</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="MIN"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="rounded-none border-border h-11 text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/30"
                            />
                            <Input
                                type="number"
                                placeholder="MAX"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="rounded-none border-border h-11 text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-4">
                        <Label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Ordering</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="rounded-none border-border h-11 text-[11px] font-bold uppercase tracking-widest">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-border">
                                <SelectItem value="newest" className="text-[10px] font-bold uppercase tracking-widest">Newest Arrivals</SelectItem>
                                <SelectItem value="price_asc" className="text-[10px] font-bold uppercase tracking-widest">Price: Low to High</SelectItem>
                                <SelectItem value="price_desc" className="text-[10px] font-bold uppercase tracking-widest">Price: High to Low</SelectItem>
                                <SelectItem value="rating" className="text-[10px] font-bold uppercase tracking-widest">Top Rated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        <Button
                            onClick={handleApplyFilters}
                            className="btn-premium rounded-none h-14 text-[10px] font-black tracking-widest uppercase"
                        >
                            Update Results
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="rounded-none h-12 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground"
                        >
                            Clear All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
