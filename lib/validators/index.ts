export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validators = {
  email: (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !re.test(email)) {
      throw new ValidationError('email', 'Invalid email address')
    }
    return email.trim().toLowerCase()
  },

  phoneNumber: (phone: string) => {
    const re = /^\+?[1-9]\d{1,14}$/
    if (!phone || !re.test(phone.replace(/\s/g, ''))) {
      throw new ValidationError('phone', 'Invalid phone number')
    }
    return phone.trim()
  },

  uuid: (id: string) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!id || !re.test(id)) {
      throw new ValidationError('id', 'Invalid UUID format')
    }
    return id.toLowerCase()
  },

  required: (value: any, field: string) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw new ValidationError(field, `${field} is required`)
    }
    return value
  },

  string: (value: any, field: string, minLength = 1, maxLength = 255) => {
    validators.required(value, field)
    if (typeof value !== 'string') {
      throw new ValidationError(field, `${field} must be a string`)
    }
    if (value.length < minLength) {
      throw new ValidationError(field, `${field} must be at least ${minLength} characters`)
    }
    if (value.length > maxLength) {
      throw new ValidationError(field, `${field} must not exceed ${maxLength} characters`)
    }
    return value.trim()
  },

  number: (value: any, field: string, min?: number, max?: number) => {
    validators.required(value, field)
    const num = Number(value)
    if (isNaN(num)) {
      throw new ValidationError(field, `${field} must be a number`)
    }
    if (min !== undefined && num < min) {
      throw new ValidationError(field, `${field} must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new ValidationError(field, `${field} must not exceed ${max}`)
    }
    return num
  },

  boolean: (value: any, field: string) => {
    if (typeof value !== 'boolean') {
      throw new ValidationError(field, `${field} must be a boolean`)
    }
    return value
  },

  enum: (value: any, field: string, allowedValues: string[]) => {
    validators.required(value, field)
    if (!allowedValues.includes(String(value))) {
      throw new ValidationError(field, `${field} must be one of: ${allowedValues.join(', ')}`)
    }
    return value
  },

  url: (value: any, field: string) => {
    validators.required(value, field)
    try {
      new URL(value)
      return value
    } catch {
      throw new ValidationError(field, `${field} must be a valid URL`)
    }
  },
}
