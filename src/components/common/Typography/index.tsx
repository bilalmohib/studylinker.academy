interface TypographyProps {
  className?: string;
  children?: React.ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export const Heading1 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
  as = "h2",
}: TypographyProps) => {
  return as === "h1" ? (
    <h1
      className={`font-inter font-bold text-[28px] md:text-[32px] lg:text-5xl leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h1>
  ) : (
    <h2
      className={`font-inter font-bold text-[28px] md:text-[32px] lg:text-5xl leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h2>
  );
};

export const Heading2 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <h2
      className={`font-inter font-bold text-[28px] sm:text-4xl leading-[142%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h2>
  );
};

export const Heading3 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <h3
      className={`font-inter font-bold text-3xl leading-[142%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h3>
  );
};

export const Heading4 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <h4
      className={`font-inter font-bold text-2xl leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h4>
  );
};

export const Heading5 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <h5
      className={`font-inter font-bold text-xl leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h5>
  );
};

export const Heading6 = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <h6
      className={`font-inter font-bold text-base leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </h6>
  );
};

export const Paragraph = ({
  className,
  children,
  dangerouslySetInnerHTML,
  style,
}: TypographyProps) => {
  return (
    <p
      className={`font-inter font-normal text-[15px] md:text-base lg:text-xl leading-[142%] tracking-[0%] text-heading ${className}`}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={style}
    >
      {children}
    </p>
  );
};
