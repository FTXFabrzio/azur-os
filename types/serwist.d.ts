declare module "@serwist/sw" {
  import { PrecacheEntry, SerwistGlobalConfig } from "serwist";
  
  export interface InstallSerwistOptions {
    precacheEntries?: (string | PrecacheEntry)[];
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    navigationPreload?: boolean;
    runtimeCaching?: any[];
  }

  export function installSerwist(options: InstallSerwistOptions): void;
}

declare module "serwist/legacy" {
  export * from "serwist";
}

// Fix for Service Worker type conflicts in dependencies
interface MessageEvent<T = any> extends Event {
    readonly data: T;
    readonly lastEventId: string;
    readonly origin: string;
    readonly ports: ReadonlyArray<MessagePort>;
    readonly source: MessageEventSource | null;
}

