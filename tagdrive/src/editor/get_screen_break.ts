import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

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
            currentBreakpoint = breakpoint;
        }
    }
    return currentBreakpoint;
}