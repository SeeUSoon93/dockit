const ICONS = {
  DiceOne: (
    <g>
      <circle cx="25" cy="25" r="5" />
    </g>
  ),
  DiceTwo: (
    <g>
      <circle cx="35.6066017" cy="14.3933983" r="5" />
      <circle cx="14.3933983" cy="35.6066017" r="5" />
    </g>
  ),
  DiceThree: (
    <g>
      <circle cx="35.6066017" cy="14.3933983" r="5" />
      <circle cx="25" cy="25" r="5" />
      <circle cx="14.3933983" cy="35.6066017" r="5" />
    </g>
  ),
  DiceFour: (
    <g>
      <g>
        <circle cx="35.6066017" cy="14.3933983" r="5" />
        <circle cx="14.3933983" cy="35.6066017" r="5" />
        <circle cx="35.6066017" cy="35.6066017" r="5" />
        <circle cx="14.3933983" cy="14.3933983" r="5" />
      </g>
    </g>
  ),
  DiceFive: (
    <g>
      <circle cx="35.6066017" cy="14.3933983" r="5" />
      <circle cx="25" cy="25" r="5" />
      <circle cx="14.3933983" cy="35.6066017" r="5" />
      <circle cx="35.6066017" cy="35.6066017" r="5" />
      <circle cx="14.3933983" cy="14.3933983" r="5" />
    </g>
  ),
  DiceSix: (
    <g>
      <circle cx="15" cy="10" r="5" />
      <circle cx="15" cy="25" r="5" />
      <circle cx="15" cy="40" r="5" />
      <circle cx="35" cy="10" r="5" />
      <circle cx="35" cy="25" r="5" />
      <circle cx="35" cy="40" r="5" />
    </g>
  ),
  Plus: (
    <path d="M34.1669922,23.4042969h-7.5712891v-8.4042969c0-.8813477-.7143555-1.5957031-1.5957031-1.5957031s-1.5957031.7143555-1.5957031,1.5957031v8.4042969h-7.5708008c-.8813477,0-1.5957031.7143555-1.5957031,1.5957031s.7143555,1.5957031,1.5957031,1.5957031h7.5708008v8.4042969c0,.8808594.7143555,1.5957031,1.5957031,1.5957031s1.5957031-.7148438,1.5957031-1.5957031v-8.4042969h7.5712891c.8808594,0,1.5957031-.7143555,1.5957031-1.5957031s-.7148438-1.5957031-1.5957031-1.5957031Z" />
  ),
  Minus: (
    <path d="M34.1669922,26.5957031H15.8334961c-.8813477,0-1.5957031-.7143555-1.5957031-1.5957031s.7143555-1.5957031,1.5957031-1.5957031h18.3334961c.8808594,0,1.5957031.7143555,1.5957031,1.5957031s-.7148438,1.5957031-1.5957031,1.5957031Z" />
  )
};

const components = Object.entries(ICONS).reduce((acc, [name, path]) => {
  const Component = ({ size = 24, color, style = {}, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50" // viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      width={size}
      height={size}
      fill={color || "currentColor"}
      style={style}
      {...props}
    >
      {path}
    </svg>
  );

  Component.displayName = name;
  acc[name] = Component;
  return acc;
}, {});

export const DiceOne = components.DiceOne;
export const DiceTwo = components.DiceTwo;
export const DiceThree = components.DiceThree;
export const DiceFour = components.DiceFour;
export const DiceFive = components.DiceFive;
export const DiceSix = components.DiceSix;
export const Plus = components.Plus;
export const Minus = components.Minus;
