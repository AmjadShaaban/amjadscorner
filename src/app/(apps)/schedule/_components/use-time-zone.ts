"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The visitor's IANA time zone, or null during server rendering. */
export function useBrowserTimeZone(): string | null {
  return useSyncExternalStore(subscribe, getBrowserTimeZone, () => null);
}

/** All IANA zones the browser knows, with `current` first if the list lacks it (e.g. "UTC"). */
export function zoneOptions(current: string): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  return zones.includes(current) ? zones : [current, ...zones];
}
