import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// jsdom doesn't scroll
window.scrollTo = () => {};
