import resolveConfig from 'tailwindcss/resolveConfig';
// Import the tailwind config file
// @ts-expect-error This file exists
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

export const getBreakpointValue = (value: string): number =>
  +fullConfig.theme.screens[value].slice(
    0,
    fullConfig.theme.screens[value].indexOf('px')
  );

export function getCurrentBreakpoint(): "unknown" | "sm" | "md" | "lg" | "xl" | "2xl" {
    let currentBreakpoint: "unknown" | "sm" | "md" | "lg" | "xl" | "2xl"  = "unknown";
    let biggestBreakpointValue = 0; 
    for (const breakpoint of Object.keys(fullConfig.theme.screens)) {
        const breakpointValue = getBreakpointValue(breakpoint);
        if (
        breakpointValue > biggestBreakpointValue &&
        window.innerWidth >= breakpointValue
        ) {
            biggestBreakpointValue = breakpointValue;
            // @ts-expect-error Breakpoint will always be one of the valid values
            currentBreakpoint = breakpoint;
        }
    }
    return currentBreakpoint;
}