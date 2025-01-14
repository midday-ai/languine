const bars = Array(12).fill(0);

export const Loader = ({ size = 16 }) => {
  return (
    <div className="loading-parent">
      <div
        className="loading-wrapper"
        data-visible
        // @ts-ignore
        style={{ "--loader-size": `${size}px` }}
      >
        <div className="loader">
          {bars.map((_, i) => (
            <div className="loading-bar" key={`loader-bar-${i.toString()}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
