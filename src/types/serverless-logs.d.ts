declare module "@serverless/utils/log" {
    type Logger = ((message?: string) => void) & {
        debug(message: string): void;
        verbose(message: string): void;
        success(message: string): void;
        warning(message: string): void;
        error(message: string): void;
        get(namespace: string): Logger;
    };

    class Progress {
        update(message?: string): void;
        remove(): void;
    }

    export function writeText(message?: string | string[]): void;
    export const log: Logger;
    export const progress: {
        create(opts?: { message: string }): Progress;
    };
}
