import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";

interface MultiSelectDropdownProps {
  icon: React.ReactNode;
  label: string;
  items: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  formatItem?: (item: string) => string;
  disabled?: boolean;
}

const MultiSelectDropdown = ({ icon, label, items, selected, onSelectionChange, formatItem, disabled }: MultiSelectDropdownProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((item) => selected.includes(item));

  const toggleItem = (item: string) => {
    onSelectionChange(
      selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(selected.filter((s) => !filtered.includes(s)));
    } else {
      const newSelected = new Set([...selected, ...filtered]);
      onSelectionChange([...newSelected]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
    setSearch("");
  };

  const displayLabel = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-sm"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        {icon}
        {displayLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[calc(100vw-2rem)] sm:w-64 max-w-[280px] bg-popover border border-border rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholderFilter")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Select All + Clear All */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <button
              onClick={toggleAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {allSelected ? t("clearAll") : t("selectAll")}
            </button>
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <X className="w-3 h-3" />
                {t("clearAll")}
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No results</p>
            ) : (
              filtered.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent/10 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={selected.includes(item)}
                    onCheckedChange={() => toggleItem(item)}
                  />
                  <span className="truncate">{formatItem ? formatItem(item) : item}</span>
                </label>
              ))
            )}
          </div>

          {/* Selected count */}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
              {selected.length} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
