// Declaraciones para permitir imports de archivos CSS/SCSS en TypeScript
declare module '*.css' {
  const content: { [className: string]: string } | string;
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string } | string;
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
