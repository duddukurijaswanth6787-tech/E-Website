import { useState, useCallback } from 'react';
import { FORM_RULES, type ValidationRule } from './formRules';
import { sanitizers } from './sanitizers';

export const useValidation = (initialState: any) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any) => {
    const rules = (FORM_RULES as any)[name] as ValidationRule[];
    if (!rules) return '';

    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return '';
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    // Apply sanitizers based on field type/name
    if (name === 'email') processedValue = sanitizers.email(value);
    if (name === 'name') processedValue = sanitizers.name(value);
    if (type === 'tel') processedValue = sanitizers.numeric(value).slice(0, 10);
    if (name === 'pincode') processedValue = sanitizers.numeric(value).slice(0, 6);

    setValues((prev: any) => ({ ...prev, [name]: processedValue }));
    
    // Real-time validation
    const error = validateField(name, processedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<any>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(values).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, values]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    setValues,
    setErrors
  };
};
