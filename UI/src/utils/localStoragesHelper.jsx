export const getLocalStorageItem = (name) => {
  try {
    const itemStr = localStorage.getItem(name);
    if (!itemStr) {
      console.log(`Item with name "${name}" not found in localStorage.`);
      return null;
    }
    const item = JSON.parse(itemStr);
    return item.value;
  } catch (err) {
    console.error(
      `Error retrieving item with name "${name}" from localStorage.`,
      err
    );
    return null;
  }
};
export const setLocalStorageItem = (name, value) => {
  const item = {
    value: value,
  };
  localStorage.setItem(name, JSON.stringify(item));
};
export const clearAllLocalStorage = () => {
  localStorage.clear();
};
