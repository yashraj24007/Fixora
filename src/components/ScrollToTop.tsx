import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top on route change, not on refresh
    // The browser will handle scroll restoration on refresh automatically
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant for immediate scroll on navigation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
