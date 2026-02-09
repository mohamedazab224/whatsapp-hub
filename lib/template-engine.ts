import Handlebars from "handlebars";

export function render(template: string, data: Record<string, any>) {
  const compiled = Handlebars.compile(template);
  return compiled(data);
}
