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
            <div className="flex items-center justify-between mb-4 md:hidden">
                <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters & Sort
                </Button>
            </div>

            <div className={`${isOpen ? 'block' : 'hidden'} md:block space-y-6`}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price Range Filter */}
                        <div className="space-y-2">
                            <Label>Price Range (KSh)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <Label>Sort By</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Top Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button onClick={handleApplyFilters} className="w-full">
                                Apply Filters
                            </Button>
                            <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground">
                                <X className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
