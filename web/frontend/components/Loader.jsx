import React from "react";

const Loader = () => {
  const loadingStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh", // Ensures full viewport height
  };

  return (
    <>
      <div style={loadingStyle}>
        <div className="spinner"></div>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    </>
  );
};

export default Loader;
