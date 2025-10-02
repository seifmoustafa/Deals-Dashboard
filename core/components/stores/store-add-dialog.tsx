"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader, ImageIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { getCountryOptions } from "@/core/utils/countries";
import { cn } from "@/lib/utils";

interface StoreAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    imageFile: File | null,
    storeUrl: string,
    description: string,
    countries: string[]
  ) => void;
  isLoading: boolean;
  categoryId: string;
}

export function StoreAddDialog({
  open,
  onClose,
  onSave,
  isLoading,
  categoryId,
}: StoreAddDialogProps) {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [storeUrl, setStoreUrl] = useState("");
  const [description, setDescription] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [openCountrySelect, setOpenCountrySelect] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Clear form when dialog closes
      setTitle("");
      setImageFile(null);
      setImagePreview("");
      setStoreUrl("");
      setDescription("");
      setCountries([]);
      setCountrySearchValue("");
      setOpenCountrySelect(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title, imageFile, storeUrl, description, countries);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleCountrySelect = (country: string) => {
    if (!countries.includes(country)) {
      setCountries([...countries, country]);
    }
    setCountrySearchValue("");
    setOpenCountrySelect(false);
  };

  const handleCountryRemove = (countryToRemove: string) => {
    setCountries(countries.filter((country) => country !== countryToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <div className="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Store preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                      disabled={isLoading}
                    >
                      <span className="sr-only">Remove image</span>×
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Upload image
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Store Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter store name"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store-url">Store URL</Label>
              <Input
                id="store-url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="Enter store URL"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter store description"
                disabled={isLoading}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="countries">Countries</Label>
              <Popover
                open={openCountrySelect}
                onOpenChange={setOpenCountrySelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCountrySelect}
                    className="w-full justify-between h-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                    disabled={isLoading}
                  >
                    {countries.length > 0
                      ? `${countries.length} countries selected`
                      : "Select countries..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-2">
                    <Input
                      placeholder="Search countries..."
                      value={countrySearchValue}
                      onChange={(e) => setCountrySearchValue(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {getCountryOptions().filter((country) =>
                        country.label
                          .toLowerCase()
                          .includes(countrySearchValue.toLowerCase())
                      ).length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No country found.
                        </div>
                      ) : (
                        getCountryOptions()
                          .filter((country) =>
                            country.label
                              .toLowerCase()
                              .includes(countrySearchValue.toLowerCase())
                          )
                          .map((country) => {
                            const isSelected = countries.includes(
                              country.value
                            );
                            return (
                              <div
                                key={country.value}
                                onClick={() => {
                                  if (isSelected) {
                                    handleCountryRemove(country.value);
                                  } else {
                                    handleCountrySelect(country.value);
                                  }
                                }}
                                className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {country.label}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {countries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {countries.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {country}
                      <button
                        type="button"
                        onClick={() => handleCountryRemove(country)}
                        className="ml-1 text-green-600 hover:text-green-800"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
