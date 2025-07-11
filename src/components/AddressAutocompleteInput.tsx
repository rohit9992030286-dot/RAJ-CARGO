'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { addressAutocomplete } from '@/ai/flows/address-autocomplete';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressAutocompleteInputProps extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

const AddressAutocompleteInput = forwardRef<HTMLInputElement, AddressAutocompleteInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
      if (inputValue.length < 3) {
        setSuggestions([]);
        if (isPopoverOpen) setIsPopoverOpen(false);
        return;
      }

      setIsLoading(true);
      if (!isPopoverOpen) setIsPopoverOpen(true);

      const timerId = setTimeout(() => {
        addressAutocomplete({ partialAddress: inputValue })
          .then((res) => {
            setSuggestions(res.suggestions || []);
          })
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }, 500); // 500ms debounce

      return () => clearTimeout(timerId);
    }, [inputValue, isPopoverOpen]);

    const handleSelectSuggestion = (suggestion: string) => {
      onValueChange(suggestion);
      setInputValue(suggestion);
      setIsPopoverOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onValueChange(newValue);
    }

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverAnchor>
          <Input
            ref={ref}
            value={inputValue}
            onChange={handleInputChange}
            className={cn("w-full", className)}
            autoComplete="off"
            {...props}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left p-2 text-sm rounded-md hover:bg-accent flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          ) : (
            inputValue.length > 2 && (
              <p className="p-2 text-center text-sm text-muted-foreground">
                No suggestions found.
              </p>
            )
          )}
        </PopoverContent>
      </Popover>
    );
  }
);
AddressAutocompleteInput.displayName = 'AddressAutocompleteInput';

export { AddressAutocompleteInput };
