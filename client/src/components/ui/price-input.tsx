import { forwardRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatPriceInput, currencyToValue } from "@/lib/price-utils";
import { cn } from "@/lib/utils";

export interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    // Atualiza o valor formatado quando o valor prop muda
    useEffect(() => {
      if (value) {
        // Se o valor já está em formato numérico, converte para centavos e formata
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          const centavos = Math.round(numericValue * 100).toString();
          const formatted = formatPriceInput(centavos);
          setDisplayValue(formatted);
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Formata o valor de entrada
      const formatted = formatPriceInput(inputValue);
      setDisplayValue(formatted);
      
      // Converte para valor numérico e chama onChange
      if (onChange) {
        const numericValue = currencyToValue(formatted);
        onChange(numericValue);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn("text-right", className)}
        placeholder="R$ 0,00"
      />
    );
  }
);

PriceInput.displayName = "PriceInput";

export { PriceInput };