type DecorLayerProps = {
  mode: "home" | "matching" | "reveal";
};

export function DecorLayer({ mode }: DecorLayerProps) {
  return (
    <div className={`decor-layer decor-${mode}`} aria-hidden="true">
      <span className="glow glow-a" />
      <span className="glow glow-b" />
      <span className="glow glow-c" />
      {mode === "reveal" ? (
        <>
          <span className="confetti c1" />
          <span className="confetti c2" />
          <span className="confetti c3" />
          <span className="confetti c4" />
          <span className="confetti c5" />
          <span className="confetti c6" />
        </>
      ) : null}
    </div>
  );
}
