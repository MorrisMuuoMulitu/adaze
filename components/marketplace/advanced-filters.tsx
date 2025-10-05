"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { StarRating } from '@/components/reviews/star-rating';

export interface FilterOptions {
  priceRange: [number, number];
  minRating?: number;
  category?: string;
  availability?: 'all' | 'in_stock' | 'low_stock';
  sortBy: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  maxPrice: number;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  categories,
  maxPrice,
}: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleRatingFilter = (rating: number) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    });
  };

  const handleAvailabilityChange = (availability: string) => {
    onFiltersChange({
      ...filters,
      availability: availability as FilterOptions['availability'],
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as FilterOptions['sortBy'],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      sortBy: 'newest',
      availability: 'all',
    });
  };

  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.minRating ||
    filters.category ||
    (filters.availability && filters.availability !== 'all');

  return (
    <div className="space-y-4">
      {/* Sort and Filter Toggle Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Sort by:</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <button
                onClick={() => handleCategoryChange('all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.minRating && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ stars
              <button
                onClick={() => handleRatingFilter(filters.minRating!)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              KSh {filters.priceRange[0]} - KSh {filters.priceRange[1]}
              <button
                onClick={() => handlePriceChange([0, maxPrice])}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.availability && filters.availability !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.availability === 'in_stock' ? 'In Stock' : 'Low Stock'}
              <button
                onClick={() => handleAvailabilityChange('all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-6"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Expandable Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range Filter */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  KSh {filters.priceRange[0]} - KSh {filters.priceRange[1]}
                </span>
              </div>
              <Slider
                min={0}
                max={maxPrice}
                step={100}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label>Minimum Rating</Label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors ${
                      filters.minRating === rating ? 'bg-muted' : ''
                    }`}
                  >
                    <StarRating rating={rating} size="sm" />
                    <span className="text-sm">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={filters.availability || 'all'}
                onValueChange={handleAvailabilityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
