import { useCallback, useState } from "react";

const useForceUpdate = () => {
  const [, setValue] = useState(0);
  return useCallback(() => setValue((prev) => prev + 1), []);
};
export default useForceUpdate;
