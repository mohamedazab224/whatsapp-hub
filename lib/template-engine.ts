import Handlebars from "handlebars"

export const render = (template: string, variables: Record<string, unknown> = {}) => {
  const compiled = Handlebars.compile(template)
  return compiled(variables)
}
