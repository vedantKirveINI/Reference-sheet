import { useEffect, useState } from "react";

export default function useScriptLoader(src) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);

  return loaded;
}
